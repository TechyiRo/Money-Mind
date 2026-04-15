const Udhari = require('../models/Udhari');

// @desc    Get all udhari (dues)
// @route   GET /api/udhari
// @access  Private
const getUdhari = async (req, res) => {
  try {
    const udhari = await Udhari.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(udhari);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new udhari record
// @route   POST /api/udhari
// @access  Private
const createUdhari = async (req, res) => {
  try {
    const { personName, amount, type, date, note } = req.body;

    const udhari = new Udhari({
      userId: req.user._id,
      personName,
      amount,
      type, // 'gave' or 'received'
      date,
      note
    });

    const savedUdhari = await udhari.save();
    res.status(201).json(savedUdhari);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update udhari record
// @route   PUT /api/udhari/:id
// @access  Private
const updateUdhari = async (req, res) => {
  try {
    const udhari = await Udhari.findOne({ _id: req.params.id, userId: req.user._id });

    if (!udhari) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const { personName, amount, type, date, note } = req.body;

    udhari.personName = personName || udhari.personName;
    udhari.amount = amount !== undefined ? amount : udhari.amount;
    udhari.type = type || udhari.type;
    udhari.date = date || udhari.date;
    udhari.note = note !== undefined ? note : udhari.note;

    const updatedUdhari = await udhari.save();
    res.json(updatedUdhari);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark udhari as settled
// @route   PATCH /api/udhari/:id/settle
// @access  Private
const settleUdhari = async (req, res) => {
  try {
    const udhari = await Udhari.findOne({ _id: req.params.id, userId: req.user._id });

    if (!udhari) {
      return res.status(404).json({ message: 'Record not found' });
    }

    udhari.isSettled = true;
    udhari.settledAt = new Date();

    const updatedUdhari = await udhari.save();
    res.json(updatedUdhari);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete udhari record
// @route   DELETE /api/udhari/:id
// @access  Private
const deleteUdhari = async (req, res) => {
  try {
    const udhari = await Udhari.findOne({ _id: req.params.id, userId: req.user._id });

    if (!udhari) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await Udhari.deleteOne({ _id: req.params.id });
    res.json({ message: 'Record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUdhari,
  createUdhari,
  updateUdhari,
  settleUdhari,
  deleteUdhari
};
