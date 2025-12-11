const Transaction = require('../models/Transaction');

// 1. Get All Transactions (with Pagination & Search)
exports.getAllTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            perPage = 10,
            search = '',
            region,
            gender,
            ageMin,
            ageMax,
            category,
            tags,
            paymentMethod,
            dateFrom,
            dateTo,
            sortBy = 'Date',
            sortDir = 'desc',
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { CustomerName: { $regex: search, $options: 'i' } },
                { PhoneNumber: { $regex: search, $options: 'i' } },
                { ProductName: { $regex: search, $options: 'i' } },
            ];
        }

        if (region) query.CustomerRegion = region;
        if (gender) query.Gender = gender;
        if (paymentMethod) query.PaymentMethod = paymentMethod;
        if (category) query.ProductCategory = category;

        if (ageMin || ageMax) {
            query.Age = {};
            if (ageMin) query.Age.$gte = parseInt(ageMin);
            if (ageMax) query.Age.$lte = parseInt(ageMax);
        }

        if (tags) {
            const tagList = Array.isArray(tags)
                ? tags
                : String(tags).split(',').map(t => t.trim()).filter(Boolean);
            if (tagList.length) query.Tags = { $in: tagList };
        }

        if (dateFrom || dateTo) {
            query.Date = {};
            if (dateFrom) query.Date.$gte = new Date(dateFrom);
            if (dateTo) query.Date.$lte = new Date(dateTo);
        }

        const sort = {};
        const dir = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;
        const allowedSort = new Set([
            'Date', 'CustomerName', 'ProductName', 'TotalAmount', 'Quantity', 'CustomerRegion'
        ]);
        sort[allowedSort.has(sortBy) ? sortBy : 'Date'] = dir;

        const pg = parseInt(page);
        const limit = parseInt(perPage);

        const [transactions, total] = await Promise.all([
            Transaction.find(query).sort(sort).skip((pg - 1) * limit).limit(limit),
            Transaction.countDocuments(query)
        ]);

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

exports.getMeta = async (req, res) => {
    try {
        const [regions, genders, categories, paymentMethods, tags] = await Promise.all([
            Transaction.distinct('CustomerRegion'),
            Transaction.distinct('Gender'),
            Transaction.distinct('ProductCategory'),
            Transaction.distinct('PaymentMethod'),
            Transaction.distinct('Tags'),
        ]);

        res.status(200).json({
            success: true,
            data: { regions, genders, categories, paymentMethods, tags }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
