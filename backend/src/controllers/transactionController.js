const Transaction = require('../models/Transaction');

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

        const and = [];
        if (search) {
            and.push({ $or: [
                { ['Customer Name']: { $regex: search, $options: 'i' } },
                { ['Phone Number']: { $regex: search, $options: 'i' } },
                { ['Product Name']: { $regex: search, $options: 'i' } },
                { CustomerName: { $regex: search, $options: 'i' } },
                { PhoneNumber: { $regex: search, $options: 'i' } },
                { ProductName: { $regex: search, $options: 'i' } },
            ]});
        }

        const toList = (v) => Array.isArray(v) ? v : String(v || '').split(',').map(s=>s.trim()).filter(Boolean);
        const orEq = (fields, values) => {
            const list = toList(values);
            const conds = [];
            for (const val of list) {
                for (const f of (Array.isArray(fields)?fields:[fields])) conds.push({ [f]: val });
            }
            return conds.length ? { $or: conds } : null;
        };
        const r1 = orEq(['Customer Region','CustomerRegion'], region); if (r1) and.push(r1);
        const r2 = orEq(['Gender'], gender); if (r2) and.push(r2);
        const r3 = orEq(['Payment Method','PaymentMethod'], paymentMethod); if (r3) and.push(r3);
        const r4 = orEq(['Product Category','ProductCategory'], category); if (r4) and.push(r4);

        const hasAge = typeof ageMin !== 'undefined' || typeof ageMax !== 'undefined';
        const ageMinNum = ageMin !== undefined && ageMin !== '' ? parseInt(ageMin) : undefined;
        const ageMaxNum = ageMax !== undefined && ageMax !== '' ? parseInt(ageMax) : undefined;
        const exactAge = (ageMinNum !== undefined && ageMaxNum === undefined) ? ageMinNum
                         : (ageMaxNum !== undefined && ageMinNum === undefined) ? ageMaxNum
                         : undefined;

        if (tags) {
            const tagList = toList(tags);
            if (tagList.length) {
                and.push({ $or: [
                    { Tags: { $in: tagList } },
                    { ['Tags']: { $regex: tagList.join('|'), $options: 'i' } }
                ]});
            }
        }

        if (dateFrom || dateTo) {
            const expr = [];
            const field = { $cond: [
                { $eq: [ { $type: '$Date' }, 'string' ] },
                { $dateFromString: { dateString: '$Date' } },
                '$Date'
            ] };
            if (dateFrom) expr.push({ $gte: [ field, new Date(dateFrom) ] });
            if (dateTo) expr.push({ $lte: [ field, new Date(dateTo) ] });
            if (expr.length) and.push({ $expr: { $and: expr } });
        }

        const dir = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;
        const sortMap = { Date: 'Date', CustomerName: 'Customer Name', ProductName: 'Product Name', TotalAmount: 'Total Amount', Quantity: 'Quantity', CustomerRegion: 'Customer Region' };
        const sortField = sortMap[sortBy] || 'Date';

        const pg = parseInt(page);
        const limit = parseInt(perPage);
        const baseMatch = and.length ? { $and: and } : {};
        const coll = Transaction.collection;

        const pipeline = [];
        if (Object.keys(baseMatch).length) pipeline.push({ $match: baseMatch });
        if (hasAge) {
            pipeline.push({ $addFields: { AgeNum: { $toInt: { $trim: { input: { $ifNull: ['$Age', ''] }, chars: ' ' } } } } });
            const ageCond = exactAge !== undefined
                ? { AgeNum: exactAge }
                : { AgeNum: {
                        ...(ageMinNum !== undefined ? { $gte: ageMinNum } : {}),
                        ...(ageMaxNum !== undefined ? { $lte: ageMaxNum } : {}),
                    }
                  };
            pipeline.push({ $match: ageCond });
        }
        pipeline.push({ $sort: { [sortField]: dir } });
        pipeline.push({ $skip: (pg - 1) * limit });
        pipeline.push({ $limit: limit });

        const countPipeline = pipeline.filter(s => !('$skip' in s) && !('$limit' in s) && !('$sort' in s)).concat([{ $count: 'total' }]);
        const [transactionsArr, totalArr] = await Promise.all([
            coll.aggregate(pipeline).toArray(),
            coll.aggregate(countPipeline).toArray()
        ]);
        const transactions = transactionsArr;
        const total = totalArr[0]?.total || 0;

        res.status(200).json({ success: true, count: total, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getStatistics = async (req, res) => {
    try {
        const coll = Transaction.collection;
        const stats = await coll.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $toDouble: { $ifNull: ['$Total Amount', '$TotalAmount'] } } },
                    totalItems: { $sum: { $toDouble: { $ifNull: ['$Quantity', 0] } } },
                    avgOrderValue: { $avg: { $toDouble: { $ifNull: ['$Total Amount', '$TotalAmount'] } } }
                }
            }
        ]).toArray();
        const s = stats[0] || { totalRevenue: 0, totalItems: 0, avgOrderValue: 0 };
        res.status(200).json({ success: true, data: { totalTransactions: await coll.countDocuments({}), totalRevenue: s.totalRevenue || 0, totalItems: s.totalItems || 0, avgOrderValue: s.avgOrderValue || 0 } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMeta = async (req, res) => {
    try {
        const coll = Transaction.collection;
        const [
            regionsA, regionsB,
            genders,
            categoriesA, categoriesB,
            paymentA, paymentB,
            tagsA
        ] = await Promise.all([
            coll.distinct('Customer Region'),
            coll.distinct('CustomerRegion'),
            coll.distinct('Gender'),
            coll.distinct('Product Category'),
            coll.distinct('ProductCategory'),
            coll.distinct('Payment Method'),
            coll.distinct('PaymentMethod'),
            coll.distinct('Tags')
        ]);
        const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
        const regions = uniq([...(regionsA||[]), ...(regionsB||[])]);
        const categories = uniq([...(categoriesA||[]), ...(categoriesB||[])]);
        const paymentMethods = uniq([...(paymentA||[]), ...(paymentB||[])]);
        const tags = uniq([...(tagsA||[])].flatMap(v => Array.isArray(v) ? v : String(v).split(',').map(t=>t.trim())));
        res.status(200).json({ success: true, data: { regions, genders: uniq(genders), categories, paymentMethods, tags } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.debugAge = async (req, res) => {
    try {
        const coll = Transaction.collection;
        const min = parseInt(req.query.min || '0');
        const max = parseInt(req.query.max || '200');
        const resArr = await coll.aggregate([
            { $addFields: { AgeNum: { $toInt: { $ifNull: ['$Age', 0] } } } },
            { $match: { AgeNum: { $gte: min, $lte: max } } },
            { $facet: {
                sample: [ { $limit: 5 }, { $project: { Age: 1, AgeNum: 1, CustomerName: 1, Gender: 1 } } ],
                total: [ { $count: 'count' } ]
            } }
        ]).toArray();
        const total = resArr[0]?.total?.[0]?.count || 0;
        res.status(200).json({ success: true, total, sample: resArr[0]?.sample || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.debugDate = async (req, res) => {
    try {
        const coll = Transaction.collection;
        const from = req.query.from ? new Date(req.query.from) : new Date('2023-01-01');
        const to = req.query.to ? new Date(req.query.to) : new Date('2023-12-31');
        const resArr = await coll.aggregate([
            { $addFields: { DateConv: { $cond: [ { $eq: [ { $type: '$Date' }, 'string' ] }, { $dateFromString: { dateString: '$Date' } }, '$Date' ] } } },
            { $match: { DateConv: { $gte: from, $lte: to } } },
            { $facet: {
                sample: [ { $limit: 5 }, { $project: { Date: 1, DateConv: 1, CustomerName: 1 } } ],
                total: [ { $count: 'count' } ]
            } }
        ]).toArray();
        const total = resArr[0]?.total?.[0]?.count || 0;
        res.status(200).json({ success: true, total, sample: resArr[0]?.sample || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
