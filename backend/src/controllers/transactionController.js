const Transaction = require('../models/Transaction');

// 1. Get All Transactions (with Pagination & Search)
exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = '' } = req.query;
        
        // Build Search Query (Search by Name or Product)
        const query = search ? {
            $or: [
                { CustomerName: { $regex: search, $options: 'i' } },
                { ProductName: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            count: total,
            data: transactions
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Get Statistics (Total Sale, Sold Items, etc.)
exports.getStatistics = async (req, res) => {
    try {
        const totalTransactions = await Transaction.countDocuments();
        
        const revenueStats = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$TotalAmount' },
                    totalItems: { $sum: '$Quantity' },
                    avgOrderValue: { $avg: '$TotalAmount' }
                }
            }
        ]);

        const stats = revenueStats[0] || {
            totalRevenue: 0,
            totalItems: 0,
            avgOrderValue: 0
        };

        res.status(200).json({
            success: true,
            data: {
                totalTransactions,
                totalRevenue: stats.totalRevenue || 0,
                totalItems: stats.totalItems || 0,
                avgOrderValue: stats.avgOrderValue || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
