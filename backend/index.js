import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use your specific SMTP details
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Basic testing endpoint
app.get('/', (req, res) => {
    res.send('HostelCare API is running...');
});

// Endpoint to send email notifications
app.post('/api/notifications/status-update', async (req, res) => {
    const { userEmail, studentName, complaintId, status, note } = req.body;

    if (!userEmail || !complaintId || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Complaint Status Update - ${complaintId}`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1e3a5f;">HostelCare Update</h2>
        <p>Dear ${studentName || 'Student'},</p>
        <p>Your complaint <strong>${complaintId}</strong> has been updated.</p>
        <p><strong>New Status:</strong> <span style="background: #eef2f6; padding: 4px 8px; border-radius: 4px;">${status}</span></p>
        ${note ? `<p><strong>Warden/Admin Remarks:</strong> ${note}</p>` : ''}
        <p>Please log in to your dashboard to view more details.</p>
        <br/>
        <p>Regards,<br/>Hostel Management</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email notification sent successfully' });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ error: 'Failed to send email notification' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
