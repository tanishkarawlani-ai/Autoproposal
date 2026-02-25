document.addEventListener('DOMContentLoaded', () => {
    // SUPABASE INTEGRATION
    const supabaseUrl = 'https://eczdfebfkiynucgcdrxg.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjemRmZWJma2l5bnVjZ2NkcnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5ODY3MjgsImV4cCI6MjA4NzU2MjcyOH0.GMnPo1waltZwIxni8FD292koruV3zD9_v5Vx_8Mm51Y';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const authTitle = document.getElementById('authTitle');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authToggleLink = document.getElementById('authToggleLink');
    const authError = document.getElementById('authError');
    const logoutBtn = document.getElementById('logoutBtn');

    let isLoginMode = true;

    // Toggle between Login and Signup modes
    authToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        authTitle.innerText = isLoginMode ? "Sign In" : "Create Account";
        authSubmitBtn.innerText = isLoginMode ? "Sign In" : "Sign Up";
        authToggleLink.innerText = isLoginMode ? "Need an account? Sign Up" : "Already have an account? Sign In";
        authError.innerText = "";
    });

    // Handle Authentication submission
    authSubmitBtn.addEventListener('click', async () => {
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();

        if (!email || !password) {
            authError.innerText = "Please fill in both email and password.";
            return;
        }

        authSubmitBtn.innerText = "Processing...";
        authSubmitBtn.disabled = true;
        authError.innerText = "";

        let error = null;

        if (isLoginMode) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            error = signInError;
        } else {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            error = signUpError;
            if (!error) {
                authError.innerText = "Signup successful! You can now log in.";
                authError.style.color = "#8CCB8E";
                isLoginMode = true;
                authTitle.innerText = "Sign In";
                authSubmitBtn.innerText = "Sign In";
                authToggleLink.innerText = "Need an account? Sign Up";
            }
        }

        if (error) {
            authError.style.color = "#E88F8F";
            authError.innerText = error.message;
        } else if (isLoginMode) {
            checkSession();
        }

        if (isLoginMode) authSubmitBtn.innerText = "Sign In";
        authSubmitBtn.disabled = false;
    });

    // Handle Logout
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        checkSession();
    });

    // Check existing session
    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
        } else {
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    }

    // Initialize Authentication state
    checkSession();

    // ORIGINAL UI ELEMENTS
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const outputSection = document.getElementById('outputSection');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    const subjectOut = document.getElementById('subjectOut');
    const emailOut = document.getElementById('emailOut');
    const dmOut = document.getElementById('dmOut');
    const followupOut = document.getElementById('followupOut');

    const toast = document.getElementById('toast');

    // NEW CRM ELEMENTS
    const tabGenerate = document.getElementById('tabGenerate');
    const tabDashboard = document.getElementById('tabDashboard');
    const viewGenerate = document.getElementById('viewGenerate');
    const viewDashboard = document.getElementById('viewDashboard');

    const btnInterested = document.getElementById('btnInterested');
    const btnBounced = document.getElementById('btnBounced');
    const listInterested = document.getElementById('listInterested');
    const listBounced = document.getElementById('listBounced');

    let currentLead = null;
    let leads = JSON.parse(localStorage.getItem('autopitch_leads')) || [];

    // TABS LOGIC
    tabGenerate.addEventListener('click', () => {
        tabGenerate.classList.add('active');
        tabDashboard.classList.remove('active');
        viewGenerate.classList.remove('hidden');
        viewDashboard.classList.add('hidden');
    });

    tabDashboard.addEventListener('click', () => {
        tabDashboard.classList.add('active');
        tabGenerate.classList.remove('active');
        viewDashboard.classList.remove('hidden');
        viewGenerate.classList.add('hidden');
        renderDashboard();
    });

    // Templates library
    const templates = {
        professional: {
            paid_partnership: {
                subject: "Partnership Inquiry: {brandName} x {userName}",
                email: "Hi {brandName} Team,\n\nI hope this email finds you well.\n\nMy name is {userName}, and I am a {userNiche} with a highly engaged audience that aligns perfectly with {brandName}'s target demographic. I have been following your recent campaigns and am incredibly impressed with your products.\n\nI am reaching out to explore a potential paid partnership. I would love to create high-quality, authentic content that showcases {brandName} to my community and drives measurable results for your upcoming campaigns.\n\nCould we schedule a brief call to discuss how we might collaborate and align on your current marketing objectives?\n\nBest regards,\n{userName}\n{userNiche}",
                dm: "Hi @{brandName}! 👋 I'm {userName}, a {userNiche}. I absolutely love your work and would love to explore a paid partnership together to create some high-quality content for your brand. Who is the best person to email regarding collaborations?",
                followup: "Hi {brandName} Team,\n\nI'm following up on my previous email regarding a potential partnership between {brandName} and myself.\n\nI would still love to discuss how my content as a {userNiche} could bring value to your upcoming campaigns. Let me know if you are available to connect this week.\n\nBest,\n{userName}"
            },
            internship: {
                subject: "Internship Application: {userName} - {userNiche}",
                email: "Dear Hiring Manager at {brandName},\n\nI am writing to express my strong interest in joining {brandName} as an intern. As an aspiring {userNiche}, I have greatly admired your company's innovative approach and industry leadership.\n\nI am a dedicated, fast learner with a passion for learning the ins and outs of the industry. I am confident that my background and enthusiasm would make me a valuable addition to your team, while providing me with essential hands-on experience.\n\nI have attached my resume for your review. I would welcome the opportunity to discuss how I can contribute to {brandName}.\n\nThank you for your time and consideration.\n\nSincerely,\n{userName}",
                dm: "Hi @{brandName}! I'm {userName}, an aspiring {userNiche}. I am very interested in any current or upcoming internship opportunities at your company. Where is the best place to submit my portfolio and resume?",
                followup: "Dear {brandName} Team,\n\nI recently applied for an internship position and wanted to follow up on my application.\n\nI remain very enthusiastic about the opportunity to bring my skills as a {userNiche} to your team. Please let me know if you need any additional materials from me.\n\nThank you,\n{userName}"
            },
            event_invite: {
                subject: "Event Invitation Request: {userName} x {brandName}",
                email: "Hi {brandName} PR Team,\n\nI hope this email finds you well.\n\nI am {userName}, a {userNiche} based in [City/Location]. I saw the exciting news about your upcoming event and product launch.\n\nGiven my audience's strong interest in your industry, I would love the opportunity to attend the event and share exclusive behind-the-scenes content with my community.\n\nCould you kindly let me know if there is still availability on your guest or media list? I would be thrilled to cover the event.\n\nBest regards,\n{userName}",
                dm: "Hi @{brandName}! 👋 I'm {userName}, a {userNiche}. I saw your upcoming event and would absolutely love to attend and cover it for my audience. Is there a PR contact I can reach out to for media list availability?",
                followup: "Hi {brandName} Team,\n\nI'm following up on my earlier email regarding your upcoming event.\n\nI would love to be considered for media coverage. Please let me know if there are any remaining spots available on the guest list.\n\nBest,\n{userName}"
            },
            product_collab: {
                subject: "Product Collaboration Inquiry: {userName} & {brandName}",
                email: "Hi {brandName} Team,\n\nI hope you are having a great week.\n\nMy name is {userName}, and I am a {userNiche}. I have been genuinely using and loving your products for a while now, and my audience regularly asks about them.\n\nI am reaching out to propose a product collaboration. I would love to feature {brandName} in my upcoming content schedule in exchange for product seeding. I believe this would be a highly authentic way to introduce my engaged followers to your newest releases.\n\nIf this is of interest, please let me know. I would be happy to share my media kit and engagement metrics.\n\nBest regards,\n{userName}",
                dm: "Hi @{brandName}! I'm {userName}, a {userNiche}. I'm a huge fan of your products and would love to collaborate on some content in exchange for product seeding. Can I get an email to send over my media kit?",
                followup: "Hi {brandName} Team,\n\nI wanted to circle back on my previous email regarding a product collaboration.\n\nI am still very interested in featuring {brandName} in my upcoming content. Let me know if your team is currently open to product seeding arrangements.\n\nThanks,\n{userName}"
            }
        },
        friendly: {
            // Simplified variations for time; normally I would do custom lines for all matrix.
            // Using a helper function to define them quickly.
            paid_partnership: {
                subject: "Collab Idea! 🤝 {brandName} x {userName}",
                email: "Hey {brandName} Team!\n\nHope you're having an awesome week!\n\nI'm {userName}, a {userNiche}, and I am absolutely obsessed with what you guys are doing. Your recent posts have been amazing!\n\nI'd love to chat about a potential paid partnership. I have some super fun and creative content ideas that I think my audience would eat up, perfectly highlighting {brandName}.\n\nLet me know if you're open to chatting about this!\n\nCheers,\n{userName}",
                dm: "Hey @{brandName}! 👋 I'm {userName}, a {userNiche} and a huge fan of yours! I'd love to chat about a paid collab to create some awesome content for you. Who's the best person to email? ✨",
                followup: "Hey {brandName} Team!\n\nJust bumping this up! I'd still love to chat about a partnership when you have a moment.\n\nHope you're having a great week!\n\nBest,\n{userName}"
            },
            internship: {
                subject: "Internship Inquiry ✨ {userName} ({userNiche})",
                email: "Hey {brandName} Team!\n\nHope you're doing great!\n\nI'm {userName}, a passionate {userNiche}, and I would absolutely love to join your team as an intern. I've been following your work forever and it's super inspiring to me.\n\nI'm ready to dive in, learn a ton, and help out wherever I can. \n\nI've attached my resume. Let me know if you have any internship spots opening up soon!\n\nThanks so much,\n{userName}",
                dm: "Hey @{brandName}! ✨ I'm {userName} ({userNiche}) and I'm looking for an internship! I admire your work so much. Do you have a contact I could email my info to?",
                followup: "Hey {brandName} Team!\n\nJust dropping a quick note to follow up on my internship email. Still super interested! Let me know if there's any updates.\n\nCheers,\n{userName}"
            },
            event_invite: {
                subject: "Would love to attend! 🎉 {userName} x {brandName}",
                email: "Hey {brandName} PR Team!\n\nHope this finds you well!\n\nI'm {userName}, a {userNiche}. I saw you have a super exciting event coming up and it looks incredible!\n\nI would absolutely love to attend and create some fun behind-the-scenes content for my audience. \n\nLet me know if there's any room left on the list for me to join the fun!\n\nBest,\n{userName}",
                dm: "Hey @{brandName}! 🎉 I'm {userName}, a {userNiche}. Your upcoming event looks amazing! Is there someone I can email about snagging an invite to cover it?",
                followup: "Hey {brandName} Team!\n\nJust a quick follow up about the upcoming event! Still hoping to attend and cover it if spots are available.\n\nThanks!\n{userName}"
            },
            product_collab: {
                subject: "Let's collaborate! 🎁 {brandName} x {userName}",
                email: "Hey {brandName} Team!\n\nHope you're having a great day!\n\nI'm {userName}, a {userNiche}, and I am such a huge fan of your products. I talk about them all the time!\n\nI'd love to do a product collaboration. I have some awesome content ideas where I can naturally feature {brandName} to my followers in exchange for some gifted products.\n\nLet me know if you're gifting right now, I'd love to send over my stats!\n\nCheers,\n{userName}",
                dm: "Hey @{brandName}! 🎁 I'm {userName} ({userNiche}) and I love your stuff! Are you open to any gifted product collabs right now? Would love an email contact if so!",
                followup: "Hey {brandName} Team!\n\nJust checking in on this! Still super keen to feature {brandName} on my page if you're open to gifted collabs.\n\nBest,\n{userName}"
            }
        },
        confident: {
            paid_partnership: {
                subject: "Strategic Partnership Proposal: {userName} x {brandName}",
                email: "Hi {brandName} Team,\n\nI'll keep this brief.\n\nI'm {userName}, a {userNiche}. I deliver high-converting, premium content to a highly targeted audience that exactly overlaps with {brandName}'s ideal customer.\n\nI want to discuss a paid partnership where I create dedicated content to drive direct value for your next campaign. My previous brand partners have seen excellent ROI.\n\nLet's schedule a 10-minute call this week to align on deliverables. Let me know what day works best.\n\nBest,\n{userName}",
                dm: "Hi @{brandName}. I'm {userName}, a {userNiche}. I drive strong conversions for brands like yours and want to propose a paid partnership. Where can I send my deck?",
                followup: "Hi {brandName} Team,\n\nFollowing up on my proposal. I have a slot opening up in my content calendar next month and would prioritize {brandName}.\n\nLet me know when we can connect.\n\nBest,\n{userName}"
            },
            internship: {
                subject: "Intern Candidate - {userName} ({userNiche})",
                email: "Dear {brandName} Hiring Team,\n\nMy name is {userName}, and I am a {userNiche} ready to bring my drive and skills to {brandName} as an intern.\n\nI don't just want to watch from the sidelines; I'm here to execute, learn fast, and provide tangible value to your team from day one. I understand your market and I'm ready to put in the work.\n\nI am attaching my resume and portfolio. I look forward to discussing how I can hit the ground running at {brandName}.\n\nBest,\n{userName}",
                dm: "Hi @{brandName}. I'm {userName}, a {userNiche}. I'm looking to join a high-performing team and want to intern with you. Who should I email directly?",
                followup: "Dear {brandName} Team,\n\nFollowing up on my internship application. I am ready to bring my A-game to your team. Let me know when we can schedule an interview.\n\nBest,\n{userName}"
            },
            event_invite: {
                subject: "Media Attendance: {userName} at {brandName} Event",
                email: "Hi {brandName} PR,\n\nI am {userName}, a {userNiche}. I see you have a major event coming up.\n\nMy audience is highly invested in this space, and I'd like to secure a spot on the media list to provide premium coverage of the launch for them.\n\nPlease confirm availability and details so I can add this to my coverage schedule.\n\nBest,\n{userName}",
                dm: "Hi @{brandName}. I'm {userName}, a {userNiche}. I'm setting up my coverage schedule for your upcoming event. Please direct me to the PR contact to secure my media pass.",
                followup: "Hi {brandName} PR,\n\nFollowing up to confirm my media access for the upcoming event. Please let me know the status of the guest list.\n\nBest,\n{userName}"
            },
            product_collab: {
                subject: "Content Collaboration: {userName} x {brandName}",
                email: "Hi {brandName} Team,\n\nI'm {userName}, a {userNiche}. My audience trusts my recommendations, and I want to feature {brandName} in my upcoming content schedule.\n\nI am pitching a direct exchange: high-quality, dedicated content tailored to your current marketing goals in exchange for a seeded product package.\n\nIf you want to get {brandName} in front of a fresh, engaged audience, let's make this happen. Let me know if you want to see my media kit.\n\nBest,\n{userName}",
                dm: "Hi @{brandName}. I'm {userName}, a {userNiche}. I want to feature your brand in my upcoming content in exchange for product seeding. Who's the contact to make this happen?",
                followup: "Hi {brandName} Team,\n\nChecking in regarding my product collaboration pitch. I am locking in my content calendar soon and want to know if {brandName} is in.\n\nBest,\n{userName}"
            }
        }
    };

    function replacePlaceholders(text, data) {
        return text
            .replace(/{userName}/g, data.name || "[Your Name]")
            .replace(/{userNiche}/g, data.niche || "[Your Niche]")
            .replace(/{brandName}/g, data.brand || "[Brand Name]");
    }

    generateBtn.addEventListener('click', () => {
        generatePitches();
    });

    regenerateBtn.addEventListener('click', () => {
        generatePitches();
    });

    function generatePitches() {
        const name = document.getElementById('userName').value.trim() || "[Your Name]";
        const niche = document.getElementById('userNiche').value.trim() || "[Your Niche]";
        const brand = document.getElementById('brandName').value.trim() || "[Brand Name]";
        const type = document.getElementById('collabType').value;
        const tone = document.getElementById('tone').value;

        // Validation - though simple, let's just use defaults if empty for a smooth experience
        const data = { name, niche, brand };

        const selectedTemplate = templates[tone][type];

        currentLead = {
            id: Date.now().toString(),
            brand: brand,
            subject: replacePlaceholders(selectedTemplate.subject, data),
            followup: replacePlaceholders(selectedTemplate.followup, data),
            dateCreated: new Date().toISOString()
        };

        // Hide output and show loading
        generateBtn.style.display = 'none';
        loading.classList.remove('hidden');
        outputSection.classList.add('hidden');

        // Fake loading for 1 second
        setTimeout(() => {
            // Populate areas
            subjectOut.value = replacePlaceholders(selectedTemplate.subject, data);
            emailOut.value = replacePlaceholders(selectedTemplate.email, data);
            dmOut.value = replacePlaceholders(selectedTemplate.dm, data);
            followupOut.value = replacePlaceholders(selectedTemplate.followup, data);

            // Hide loading and show output
            loading.classList.add('hidden');
            outputSection.classList.remove('hidden');
            generateBtn.style.display = 'block';

            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    }

    // Copy to clipboard functionality
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            const textArea = document.getElementById(targetId);

            textArea.select();
            document.execCommand('copy');

            // Show toast
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);

            // Temporary button text change
            const originalText = e.target.innerText;
            e.target.innerText = "Copied!";
            setTimeout(() => {
                e.target.innerText = originalText;
            }, 2000);
        });
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        const brand = document.getElementById('brandName').value.trim() || "Brand";

        const content = `
AUTOPROPOSAL PITCH FOR ${brand.toUpperCase()}
=========================================

--- EMAIL SUBJECT LINE ---
${subjectOut.value}

--- FULL PITCH EMAIL ---
${emailOut.value}

--- INSTAGRAM DM VERSION ---
${dmOut.value}

--- FOLLOW-UP MESSAGE (5-DAY) ---
${followupOut.value}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Pitch_${brand}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // CRM LOGIC
    function saveLead(status) {
        if (!currentLead) return;
        currentLead.status = status;
        leads.push(currentLead);
        localStorage.setItem('autopitch_leads', JSON.stringify(leads));

        toast.innerText = `Saved to ${status === 'interested' ? 'Interested' : 'Bounced'} leads!`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.innerText = "Copied to clipboard!"; // reset toast text
        }, 2000);

        currentLead = null;
        tabDashboard.click();
    }

    btnInterested.addEventListener('click', () => saveLead('interested'));
    btnBounced.addEventListener('click', () => saveLead('bounced'));

    function renderDashboard() {
        listInterested.innerHTML = '';
        listBounced.innerHTML = '';

        leads.forEach((lead, index) => {
            const createdDate = new Date(lead.dateCreated);
            const now = new Date();
            const daysPassed = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

            // For testing purposes, uncomment this to instantly simulate 5 days passed
            // const isReadyForFollowup = true; 
            const isReadyForFollowup = daysPassed >= 5;

            const daysText = daysPassed === 0 ? "Generated Today" : `${daysPassed} day(s) ago`;
            const buttonText = isReadyForFollowup ? "Send 5-Day Follow-up 🚀" : `Auto sends in ${5 - daysPassed} day(s) ⏰`;
            const buttonDisabled = !isReadyForFollowup ? "disabled" : "";

            const html = `
                <div class="lead-card">
                    <h4>${lead.brand}</h4>
                    <p>${daysText}</p>
                    <a href="mailto:?subject=Following up on ${lead.brand}&body=${encodeURIComponent(lead.followup)}" style="text-decoration:none;">
                        <button class="btn-auto" ${buttonDisabled}>${buttonText}</button>
                    </a>
                </div>
            `;

            if (lead.status === 'interested') {
                listInterested.innerHTML += html;
            } else {
                listBounced.innerHTML += html;
            }
        });

        if (listInterested.innerHTML === '') listInterested.innerHTML = '<p style="font-size: 0.9rem; color:#999;">No interested leads saved yet.</p>';
        if (listBounced.innerHTML === '') listBounced.innerHTML = '<p style="font-size: 0.9rem; color:#999;">No bounced leads saved yet.</p>';
    }
});
