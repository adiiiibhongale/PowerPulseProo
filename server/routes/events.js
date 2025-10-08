const express = require('express');
const { authenticate, authorizeAdmin, authorizePermission } = require('../middleware/auth');
const Event = require('../models/Event');

const router = express.Router();

// Manual create (admin utility)
router.post('/create', authenticate, authorizeAdmin, authorizePermission('write-alerts'), async (req,res)=>{
	try {
		let { type, severity='Info', detail, source, raw, consumerId, tags=[] } = req.body;
		if(!type || !detail){
			return res.status(400).json({ status:'error', message:'type and detail required' });
		}
		// Severity mapping rules (defensive; model hook will also enforce):
		// - System => Info
		// - Door/Cover/Lid open or Metal detect => Critical
		// - Under / Over voltage => Warning (unless already Critical)
		const blob = `${type||''} ${detail||''} ${raw? JSON.stringify(raw):''}`.toLowerCase();
		const doorPattern = /(door|cover|enclosure|lid)\s*open/;
		const metalPattern = /(metal\s*detect|metal\s*detected|magnet|magnetic\s*field)/;
		const voltagePattern = /(voltage\s+under|voltage\s+over|under\s*voltage|over\s*voltage|uv\)|ov\))/;
		if(type.toLowerCase()==='system') severity='Info';
		if(doorPattern.test(blob) || metalPattern.test(blob)) severity='Critical';
		else if(voltagePattern.test(blob) && severity!=='Critical') severity='Warning';
		const ev = await Event.create({ type, severity, detail, source, raw, consumerId, tags });
		res.status(201).json({ status:'success', data:{ event: ev } });
	} catch(err){
		console.error('Create event error', err);
		res.status(500).json({ status:'error', message:'Internal server error' });
	}
});

// Public (unauthenticated) read-only latest events (sanitized)
router.get('/public', async (req,res)=>{
	try {
		const { limit=50, type, severity, source, from, to } = req.query;
		const lim = Math.min(100, parseInt(limit));
		const q = {};
		if(type) q.type = type;
		if(severity) q.severity = severity;
		if(source) q.source = source;
		if(from || to){
			q.occurredAt = {};
			if(from) q.occurredAt.$gte = new Date(from);
			if(to){ const end = new Date(to); end.setHours(23,59,59,999); q.occurredAt.$lte = end; }
		}
		const events = await Event.find(q)
			.sort({ occurredAt:-1 })
			.limit(lim)
			.select('type severity detail source status occurredAt createdAt')
			.lean();
		res.status(200).json({ status:'success', data:{ events, public:true } });
	} catch(err){
		console.error('Public events error', err);
		res.status(500).json({ status:'error', message:'Internal server error' });
	}
});

// Authenticated list events (filters & pagination, full dataset)
router.get('/list', authenticate, authorizeAdmin, authorizePermission('read-alerts'), async (req,res)=>{
	try {
		const { page=1, limit=50, type, severity, status, source, consumerId, from, to, search } = req.query;
		const pg = Math.max(1, parseInt(page));
		const lim = Math.min(200, parseInt(limit));
		const skip = (pg-1)*lim;
		const q = {};
		if(type) q.type = type;
		if(severity) q.severity = severity;
		if(status) q.status = status;
		if(source) q.source = source;
		if(consumerId) q.consumerId = consumerId;
		if(from || to){
			q.occurredAt = {};
			if(from) q.occurredAt.$gte = new Date(from);
			if(to){ const end = new Date(to); end.setHours(23,59,59,999); q.occurredAt.$lte = end; }
		}
		if(search){
			q.$or = [
				{ detail: { $regex: search, $options:'i' } },
				{ type: { $regex: search, $options:'i' } },
				{ source: { $regex: search, $options:'i' } }
			];
		}
		const [events, total] = await Promise.all([
			Event.find(q).sort({ occurredAt:-1 }).skip(skip).limit(lim).lean(),
			Event.countDocuments(q)
		]);
		res.status(200).json({ status:'success', data:{ events, pagination:{ page:pg, totalPages: Math.ceil(total/lim)||1, total } } });
	} catch(err){
		console.error('List events error', err);
		res.status(500).json({ status:'error', message:'Internal server error' });
	}
});

// Acknowledge many
router.post('/ack', authenticate, authorizeAdmin, authorizePermission('write-alerts'), async (req,res)=>{
	try {
		const { ids=[] } = req.body;
		if(!Array.isArray(ids) || !ids.length){
			return res.status(400).json({ status:'error', message:'ids array required' });
		}
		const result = await Event.updateMany({ _id: { $in: ids }, status:'New' }, { $set:{ status:'Ack', acknowledgedAt:new Date(), acknowledgedBy: req.user._id } });
		res.status(200).json({ status:'success', message:`Acknowledged ${result.modifiedCount||0} events` });
	} catch(err){
		console.error('Ack events error', err);
		res.status(500).json({ status:'error', message:'Internal server error' });
	}
});

// Get by id
router.get('/:id', authenticate, authorizeAdmin, authorizePermission('read-alerts'), async (req,res)=>{
	try {
		const ev = await Event.findById(req.params.id);
		if(!ev) return res.status(404).json({ status:'error', message:'Event not found' });
		res.status(200).json({ status:'success', data:{ event: ev } });
	} catch(err){
		console.error('Get event error', err);
		res.status(500).json({ status:'error', message:'Internal server error' });
	}
});

module.exports = router;
