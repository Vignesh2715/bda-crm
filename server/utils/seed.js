require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Task = require('../models/Task');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Lead.deleteMany({}),
    Activity.deleteMany({}), FollowUp.deleteMany({}), Task.deleteMany({})
  ]);

  // Create users
  const salt = await bcrypt.genSalt(12);
  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@bdacrm.com', passwordHash: await bcrypt.hash('Admin@123', salt), role: 'admin', phone: '+91 98001 00001', department: 'Management' },
    { name: 'Sales Manager', email: 'manager@bdacrm.com', passwordHash: await bcrypt.hash('Manager@123', salt), role: 'manager', phone: '+91 98001 00002', department: 'Sales' },
    { name: 'Arjun Sharma', email: 'bda@bdacrm.com', passwordHash: await bcrypt.hash('Bda@123', salt), role: 'bda', phone: '+91 98001 00003', department: 'Business Development' },
    { name: 'Priya Patel', email: 'priya@bdacrm.com', passwordHash: await bcrypt.hash('Bda@123', salt), role: 'bda', phone: '+91 98001 00004', department: 'Business Development' },
    { name: 'Rahul Verma', email: 'rahul@bdacrm.com', passwordHash: await bcrypt.hash('Bda@123', salt), role: 'bda', phone: '+91 98001 00005', department: 'Business Development' },
  ]);

  const admin = users[0];
  const bda1 = users[2];
  const bda2 = users[3];
  const bda3 = users[4];

  // Create leads
  const leadsData = [
    { companyName: 'Tata Motors Ltd', contactPerson: 'Rajesh Kumar', email: 'rajesh@tatamotors.com', phone: '+91 98765 43210', industry: 'Automotive', source: 'LinkedIn', estimatedDealValue: 5000000, status: 'Qualified', assignedTo: bda1._id, notes: 'Interested in bulk order for assembly line components' },
    { companyName: 'Reliance Industries', contactPerson: 'Amit Shah', email: 'amit@reliance.com', phone: '+91 98765 43211', industry: 'Manufacturing', source: 'Trade Show', estimatedDealValue: 12000000, status: 'Proposal Sent', assignedTo: bda1._id, notes: 'Met at manufacturing expo. High potential deal.' },
    { companyName: 'Mahindra & Mahindra', contactPerson: 'Sunita Rao', email: 'sunita@mahindra.com', phone: '+91 98765 43212', industry: 'Automotive', source: 'Referral', estimatedDealValue: 8000000, status: 'Negotiation', assignedTo: bda2._id },
    { companyName: 'Infosys BPM', contactPerson: 'Vikram Singh', email: 'vikram@infosys.com', phone: '+91 98765 43213', industry: 'Technology', source: 'Website', estimatedDealValue: 2500000, status: 'Won', assignedTo: bda2._id },
    { companyName: 'HDFC Bank', contactPerson: 'Meena Krishnan', email: 'meena@hdfc.com', phone: '+91 98765 43214', industry: 'Finance', source: 'Cold Calling', estimatedDealValue: 3000000, status: 'Contacted', assignedTo: bda3._id },
    { companyName: 'Cipla Ltd', contactPerson: 'Dr. Ravi Gupta', email: 'ravi@cipla.com', phone: '+91 98765 43215', industry: 'Pharma', source: 'Email Campaign', estimatedDealValue: 7500000, status: 'New', assignedTo: bda1._id },
    { companyName: 'Asian Paints', contactPerson: 'Neha Joshi', email: 'neha@asianpaints.com', phone: '+91 98765 43216', industry: 'Manufacturing', source: 'LinkedIn', estimatedDealValue: 4200000, status: 'Qualified', assignedTo: bda3._id },
    { companyName: 'Wipro Technologies', contactPerson: 'Suresh Naidu', email: 'suresh@wipro.com', phone: '+91 98765 43217', industry: 'Technology', source: 'Referral', estimatedDealValue: 1800000, status: 'Lost', assignedTo: bda2._id },
    { companyName: 'Bajaj Auto', contactPerson: 'Kavita More', email: 'kavita@bajaj.com', phone: '+91 98765 43218', industry: 'Automotive', source: 'Trade Show', estimatedDealValue: 6000000, status: 'Proposal Sent', assignedTo: bda1._id },
    { companyName: 'Dr Reddys Labs', contactPerson: 'Ajay Reddy', email: 'ajay@drreddys.com', phone: '+91 98765 43219', industry: 'Pharma', source: 'Website', estimatedDealValue: 9500000, status: 'Won', assignedTo: bda3._id },
  ];

  const leads = await Lead.insertMany(leadsData);

  // Activities
  const activityTypes = ['Phone Call', 'Email', 'Meeting', 'Product Demo', 'Proposal Sent', 'Follow-Up', 'Note'];
  for (const lead of leads.slice(0, 5)) {
    for (let i = 0; i < 3; i++) {
      await Activity.create({
        leadId: lead._id,
        activityType: activityTypes[i % activityTypes.length],
        description: `Initial ${activityTypes[i % activityTypes.length].toLowerCase()} with ${lead.contactPerson}. Discussed requirements and product capabilities.`,
        outcome: i === 2 ? 'Positive response, scheduled demo' : '',
        performedBy: lead.assignedTo,
        createdAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000)
      });
    }
  }

  // Follow-ups
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await FollowUp.insertMany([
    { leadId: leads[0]._id, scheduledDate: tomorrow, purpose: 'Discuss proposal details and pricing', createdBy: bda1._id, status: 'Pending' },
    { leadId: leads[1]._id, scheduledDate: tomorrow, purpose: 'Negotiate contract terms', createdBy: bda1._id, status: 'Pending' },
    { leadId: leads[2]._id, scheduledDate: yesterday, purpose: 'Product demo follow-up', createdBy: bda2._id, status: 'Pending' },
    { leadId: leads[3]._id, scheduledDate: yesterday, purpose: 'Close the deal', createdBy: bda2._id, status: 'Completed', outcome: 'Deal won!', completedAt: new Date() },
  ]);

  // Tasks
  await Task.insertMany([
    { title: 'Prepare quotation for Tata Motors', description: 'Create detailed quotation with volume discounts', taskType: 'Send Quotation', assignedTo: bda1._id, assignedBy: admin._id, leadId: leads[0]._id, dueDate: tomorrow, priority: 'High', status: 'In Progress' },
    { title: 'Schedule demo for Cipla', taskType: 'Schedule Demo', assignedTo: bda1._id, assignedBy: admin._id, leadId: leads[5]._id, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), priority: 'Medium', status: 'Pending' },
    { title: 'Follow up with Asian Paints', taskType: 'Follow-Up', assignedTo: bda3._id, assignedBy: admin._id, leadId: leads[6]._id, dueDate: tomorrow, priority: 'High', status: 'Pending' },
    { title: 'Send product brochure to HDFC Bank', taskType: 'Call Client', assignedTo: bda3._id, assignedBy: admin._id, leadId: leads[4]._id, dueDate: yesterday, priority: 'Low', status: 'Completed', completedAt: new Date() },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin:   admin@bdacrm.com   / Admin@123');
  console.log('   Manager: manager@bdacrm.com / Manager@123');
  console.log('   BDA:     bda@bdacrm.com     / Bda@123');
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
