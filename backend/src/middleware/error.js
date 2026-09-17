const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });

const errorHandler = (err, req, res, next) => { // eslint-disable-line
  console.error(err);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return res.status(400).json({ success: false, message: `This ${field} is already in use` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }

  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error' });
};

module.exports = { notFound, errorHandler };
