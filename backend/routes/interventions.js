const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch overdue interventions
router.get('/interventions', (req, res) => {
    const currentDate = new Date();
    db.query(
        'SELECT * FROM maintenance_alerts WHERE next_due <= ? AND alert_sent = FALSE',
        [currentDate],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching interventions', error: err.message });
            }
            res.status(200).json(results);
        }
    );
});

// Update an intervention to mark as alert sent
router.put('/interventions/:id', (req, res) => {
    const { id } = req.params;
    db.query(
        'UPDATE maintenance_alerts SET alert_sent = TRUE WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating intervention', error: err.message });
            } else {
                res.status(200).json({ message: 'Intervention updated successfully' });
            }
        }
    );
});

// Resolve alert (mark as resolved)
router.post('/interventions/resolve/:vehicleId', (req, res) => {
    const { vehicleId } = req.params;

    db.query(
        'DELETE FROM maintenance_alerts WHERE vehicleId = ?', // Ensure you're using vehicleId in the query.
        [vehicleId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error resolving alert', error: err.message });
            } else {
                res.status(200).json({ message: 'Alert resolved successfully' });
            }
        }
    );
});

module.exports = router;
