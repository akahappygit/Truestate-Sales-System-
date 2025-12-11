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
        const and = [];

        if (search) {
            and.push({ $or: [
                { CustomerName: { $regex: search, $options: 'i' } },
                { PhoneNumber: { $regex: search, $options: 'i' } },
                { ProductName: { $regex: search, $options: 'i' } },
                { ['Customer Name']: { $regex: search, $options: 'i' } },
                { ['Phone Number']: { $regex: search, $options: 'i' } },
                { ['Product Name']: { $regex: search, $options: 'i' } },
            ]});
        }

        if (region) and.push({ $or: [{ CustomerRegion: region }, { ['Customer Region']: region }]});
        if (gender) and.push({ Gender: gender });
        if (paymentMethod) and.push({ $or: [{ PaymentMethod: paymentMethod }, { ['Payment Method']: paymentMethod }]});
        if (category) and.push({ $or: [{ ProductCategory: category }, { ['Product Category']: category }]});

        if (ageMin || ageMax) {
            const ageQuery = {};
            if (ageMin) ageQuery.$gte = parseInt(ageMin);
            if (ageMax) ageQuery.$lte = parseInt(ageMax);
            and.push({ Age: ageQuery });
        }

        if (tags) {
            const tagList = Array.isArray(tags)
                ? tags
                : String(tags).split(',').map(t => t.trim()).filter(Boolean);
            if (tagList.length) {
                and.push({ $or: [
                    { Tags: { $in: tagList } },
                    { ['Tags']: { $regex: tagList.join('|'), $options: 'i' } }
                ]});
            }
        }

        if (dateFrom || dateTo) {
            const dateRange = {};
            if (dateFrom) dateRange.$gte = new Date(dateFrom);
            if (dateTo) dateRange.$lte = new Date(dateTo);
            and.push({ Date: dateRange });
        }

        const sort = {};
        const dir = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;
        const sortMap = {
            Date: 'Date',
            CustomerName: 'Customer Name',
            ProductName: 'Product Name',
            TotalAmount: 'Total Amount',
            Quantity: 'Quantity',
            CustomerRegion: 'Customer Region',
        };
        const sortField = sortMap[sortBy] || 'Date';
        sort[sortField] = dir;

        const pg = parseInt(page);
        const limit = parseInt(perPage);

        const finalQuery = and.length ? { $and: and } : query;
        const [transactions, total] = await Promise.all([
            Transaction.find(finalQuery).sort(sort).skip((pg - 1) * limit).limit(limit),
            Transaction.countDocuments(finalQuery)
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
        const [
            regionsA, regionsB,
            genders,
            categoriesA, categoriesB,
            paymentA, paymentB,
            tagsA, tagsB
        ] = await Promise.all([
            Transaction.distinct('CustomerRegion'),
            Transaction.distinct('Customer Region'),
            Transaction.distinct('Gender'),
            Transaction.distinct('ProductCategory'),
            Transaction.distinct('Product Category'),
            Transaction.distinct('PaymentMethod'),
            Transaction.distinct('Payment Method'),
            Transaction.distinct('Tags'),
            Transaction.distinct('Tags')
        ]);

        const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
        const regions = uniq([...(regionsA||[]), ...(regionsB||[])]);
        const categories = uniq([...(categoriesA||[]), ...(categoriesB||[])]);
        const paymentMethods = uniq([...(paymentA||[]), ...(paymentB||[])]);
        const tags = uniq([...(tagsA||[])].flatMap(v => Array.isArray(v) ? v : String(v).split(',').map(t=>t.trim())));

        res.status(200).json({
            success: true,
            data: { regions, genders: uniq(genders), categories, paymentMethods, tags }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
