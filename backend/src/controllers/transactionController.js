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
        // We will build this later for the Dashboard charts!
        res.json({ message: "Stats coming soon" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};