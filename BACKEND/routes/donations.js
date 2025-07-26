const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Get all donations with filtering
router.get('/', async (req, res) => {
  try {
    const { role, user, status, filter } = req.query;
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by donor if user is a donor
    if (role === 'donor' && user) {
      query.donor = user;
    }
    
    // For receivers and NGOs, only show available donations
    if (role === 'receiver' || role === 'ngo') {
      query.status = 'available';
    }
    
    const donations = await Donation.find(query);
    
    // Additional filtering for receivers and NGOs
    if (role === 'receiver' || role === 'ngo') {
      const now = new Date();
      const filteredDonations = donations.filter(donation => {
        const bestBefore = new Date(donation.bestBefore);
        
        // Check if already requested by this user
        const alreadyRequested = donation.requests && donation.requests.some(r => 
          r.receiver === user && (role === 'ngo' ? r.isNGO : !r.isNGO)
        );
        
        // For NGOs: Check visibleAfter timing (2-minute delay)
        if (role === 'ngo') {
          const visibleAfter = donation.visibleAfter ? 
            new Date(donation.visibleAfter) : 
            new Date(new Date(donation.createdAt).getTime() + 120000);
          
          return now <= bestBefore && 
                 now >= visibleAfter && 
                 !alreadyRequested;
        }
        
        // For receivers: No timing delay, just check best before and not already requested
        return now <= bestBefore && !alreadyRequested;
      });
      
      return res.json(filteredDonations);
    }
    
    // For 'all' role, return all available donations without timing filters
    if (role === 'all') {
      const now = new Date();
      const allDonations = donations.filter(donation => {
        const bestBefore = new Date(donation.bestBefore);
        const alreadyRequested = donation.requests && donation.requests.some(r => 
          r.receiver === user && r.isNGO
        );
        return donation.status === 'available' && 
               now <= bestBefore && 
               !alreadyRequested;
      });
      return res.json(allDonations);
    }
    
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single donation by ID
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new donation
router.post('/', async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a donation by ID
router.put('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a donation by ID
router.delete('/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json({ message: 'Donation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 