const Vendor = require('../models/Vendor');

// Update trust score and tier for a vendor
async function updateTrustScore(vendorId, points) {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return;

    vendor.trustScore = Math.max(0, (vendor.trustScore || 0) + points);

    // Determine tier based on score
    if (vendor.trustScore >= 76) {
      vendor.trustTier = 'Platinum';
    } else if (vendor.trustScore >= 51) {
      vendor.trustTier = 'Gold';
    } else if (vendor.trustScore >= 26) {
      vendor.trustTier = 'Silver';
    } else {
      vendor.trustTier = 'Bronze';
    }

    await vendor.save();
    return vendor;
  } catch (err) {
    console.error('Trust score update error:', err);
  }
}

module.exports = { updateTrustScore };
