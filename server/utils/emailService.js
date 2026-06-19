import nodemailer from 'nodemailer';

// Email configuration - using Gmail or SendGrid SMTP
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

/**
 * Send Application Status Update Email
 */
export const sendApplicationStatusEmail = async (userEmail, jobTitle, companyName, status) => {
    const statusMessages = {
        'Accepted': 'Congratulations! Your application has been accepted.',
        'Rejected': 'Thank you for applying. Unfortunately, we\'ve decided to move forward with other candidates.',
        'Interview': 'Great news! You\'ve been invited for an interview.',
        'Pending': 'Your application is under review.',
    };

    const emailContent = `
    <h2>Application Status Update</h2>
    <p>Hi,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
    <p><strong>Status:</strong> ${status}</p>
    <p>${statusMessages[status] || 'Please log in to your account to check the details.'}</p>
    <p>Visit your dashboard: <a href="${process.env.FRONTEND_URL}/applications">View Applications</a></p>
    <p>Best regards,<br/>InsiderJobs Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: `Application Update: ${jobTitle} at ${companyName}`,
            html: emailContent,
        });
        console.log(`Email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

/**
 * Send Interview Invitation Email
 */
export const sendInterviewInviteEmail = async (userEmail, jobTitle, companyName, interviewTime, interviewLink) => {
    const emailContent = `
    <h2>Interview Invitation</h2>
    <p>Hi,</p>
    <p>Congratulations! You're invited for an interview for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
    <p><strong>Interview Date & Time:</strong> ${new Date(interviewTime).toLocaleString()}</p>
    <p><strong>Interview Link:</strong> <a href="${interviewLink}">${interviewLink}</a></p>
    <p>Please make sure to:</p>
    <ul>
        <li>Join 5 minutes before the scheduled time</li>
        <li>Test your microphone and camera</li>
        <li>Use a quiet, well-lit space</li>
        <li>Have your resume ready</li>
    </ul>
    <p>If you have any issues joining, please contact us immediately.</p>
    <p>Best regards,<br/>InsiderJobs Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: `Interview Invitation - ${jobTitle} at ${companyName}`,
            html: emailContent,
        });
        console.log(`Interview invitation sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

/**
 * Send Job Recommendation Email
 */
export const sendJobRecommendationEmail = async (userEmail, userName, recommendedJobs) => {
    const jobsList = recommendedJobs.map(job => 
        `<li>${job.title} at ${job.companyName} - <a href="${process.env.FRONTEND_URL}/apply-job/${job.jobId}">View</a></li>`
    ).join('');

    const emailContent = `
    <h2>Personalized Job Recommendations</h2>
    <p>Hi ${userName},</p>
    <p>We found some great job opportunities matching your profile:</p>
    <ul>
        ${jobsList}
    </ul>
    <p><a href="${process.env.FRONTEND_URL}/jobs">View All Jobs</a></p>
    <p>Best regards,<br/>InsiderJobs Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Your Personalized Job Recommendations',
            html: emailContent,
        });
        console.log(`Job recommendation email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

/**
 * Send Certification Earned Email
 */
export const sendCertificationEmail = async (userEmail, userName, certificationName, skillName) => {
    const emailContent = `
    <h2>🎉 Certification Earned!</h2>
    <p>Hi ${userName},</p>
    <p>Congratulations! You've successfully completed and passed the <strong>${skillName}</strong> assessment.</p>
    <p>Your certificate has been added to your profile and is now visible to recruiters.</p>
    <p><a href="${process.env.FRONTEND_URL}/profile">View Your Profile</a></p>
    <p>Keep learning and improving your skills!</p>
    <p>Best regards,<br/>InsiderJobs Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: `Certification Earned: ${certificationName}`,
            html: emailContent,
        });
        console.log(`Certification email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

/**
 * Send Welcome Email to New User
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
    const emailContent = `
    <h2>Welcome to InsiderJobs!</h2>
    <p>Hi ${userName},</p>
    <p>Welcome to InsiderJobs - Your gateway to great career opportunities!</p>
    <p>Here's what you can do on our platform:</p>
    <ul>
        <li>📄 Build an ATS-optimized resume with our resume builder</li>
        <li>🔍 Search and apply for jobs from top companies</li>
        <li>📊 Take skill assessments and earn certifications</li>
        <li>🎥 Schedule and attend video interviews</li>
        <li>📈 Track your applications in real-time</li>
    </ul>
    <p><a href="${process.env.FRONTEND_URL}">Get Started Now</a></p>
    <p>Best regards,<br/>InsiderJobs Team</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to InsiderJobs!',
            html: emailContent,
        });
        console.log(`Welcome email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};
