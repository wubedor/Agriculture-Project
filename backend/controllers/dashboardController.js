const Listing = require("../models/Listing");
const BuyerRequest = require("../models/BuyerRequest");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const listings = await Listing.find({
      farmer: userId,
    })
      .populate(
        "farmer",
        "name email phone role location"
      )
      .sort({ createdAt: -1 });

    const totalListings = listings.length;

    const active = listings.filter(
      (listing) => listing.status === "active"
    );

    const soldListings = listings.filter(
      (listing) => listing.status === "sold"
    ).length;

    const recentListings = listings.slice(0, 5);

    // Buyer matches: open buyer requests that fit one of this farmer's
    // active listings (same crop, buyer's maxPrice at or above the
    // listing's minPrice).
    const crops = [
      ...new Set(active.map((l) => String(l.crop).trim().toLowerCase())),
    ];

    const matches = [];
    const upliftPairs = [];

    if (crops.length > 0) {
      const candidates = await BuyerRequest.find({
        crop: { $in: crops },
        status: { $nin: ["cancelled", "completed"] },
      }).populate("buyer", "name email phone");

      for (const req of candidates) {
        const eligible = active.filter(
          (l) =>
            String(l.crop).trim().toLowerCase() ===
              String(req.crop).trim().toLowerCase() &&
            req.maxPrice >= l.minPrice
        );
        if (eligible.length === 0) continue;

        const best = eligible.sort((a, b) => b.minPrice - a.minPrice)[0];

        if (best.minPrice > 0) {
          upliftPairs.push(
            ((req.maxPrice - best.minPrice) / best.minPrice) * 100
          );
        }

        matches.push({ request: req, listing: best });
      }
    }

    const averagePriceUplift =
      upliftPairs.length > 0
        ? Math.round(
            upliftPairs.reduce((sum, v) => sum + v, 0) / upliftPairs.length
          )
        : 0;

    const buyerMatches = matches.map(({ request, listing }) => ({
      id: request._id,
      buyer: request.buyer ? request.buyer.name : "Buyer",
      crop: request.crop,
      offer: request.maxPrice,
      unit: request.unit,
      quantity: request.quantity,
      town: request.location?.town ?? null,
      region: request.location?.region ?? null,
      matchedListing: listing._id,
      listingMinPrice: listing.minPrice,
      status: request.status,
    }));

    res.status(200).json({
      success: true,

      stats: {
        totalListings,
        activeListings: active.length,
        soldListings,
        buyerMatches: buyerMatches.length,
        completedDeals: soldListings,
        averagePriceUplift,
      },

      recentListings,

      buyerMatches,

      transactions: [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while loading dashboard",
    });
  }
};

module.exports = {
  getDashboard,
};