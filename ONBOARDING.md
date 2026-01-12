# 🧭 Roofbot CRM – User Onboarding Guide

Welcome to Roofbot CRM!  
This guide will walk you through **how to use the system**, step-by-step, from login/signup to managing leads, appointments, jobs, and automation.

---

# 1. Signin/Signup

1. Open the CRM signup page directly from crm.invictusconnect.com or select your plan on invictusconnect.com.
2. Select your plan.
3. Create your account.
4. After Account Creation you will be redirected to checkout.
5. Make your payment,you will be redirected to signin.
6. Enter credentials and get access to CRM.

### See demo:



https://github.com/user-attachments/assets/a99334f9-b921-480c-81ed-97b886df4703


---

# 2. Dashboard Overview

The dashboard provides:

- Total Leads  
- Total Appointments  
- Total Jobs  
- Monthly/Weekly statistics  
- ServiceType filter   

### See demo:



https://github.com/user-attachments/assets/cdce1151-2d00-4820-a647-6c0172940c00



---

#  3. User Management

### 📌 Creating Users
You can create your sub users:
1. Go to **users**
2. Click **Add users**
3. Enter:
   - Name    
   - Email  
   - Role  
   - Password
4. Click  **Add users**  button.
5. Your sub **users** will be added.
6. They can also access the CRM by directly signin.

### See demo:





https://github.com/user-attachments/assets/454be701-d04c-4fee-a095-12f2e873f836


---
#  4. Profile Management

### 📌 Manage Your Profile
1. Go to **Profile**
2. You can see and edit your profile information(eg name,email,password).
3. You can also see your subscription status.
4. You can cancel your subscription from profile page.
5. You can upgrade to pro plan from profile page.
---
#  5. Leads Management

### 📌 Creating Leads
You can create leads in two ways:

#### **A. Manual Creation**
1. Go to **Leads**
2. Click **Add Lead**
3. Enter details and add your leads.

#### **B. Automatic (Chatbot)**
Leads are automatically created when customers chat via:

- Website chatbot
- Chatbot automatically create leads for you after getting details from you.
#### **C.Details**
- An automatic message sent to your leads when you create them.
- Automatic followups sent to leads based on there status(eg New,contacted,Proposal sent)
- For automatic message you will have to integrate your twilio account on integration page.
- Further in the lead page click on 🖊 you can summarize your lead.
- Same in the 🖊 you can chat with your lead but first integrate you twilio account on integration page.

  ### See demo:




https://github.com/user-attachments/assets/0396453b-3816-464d-9972-134aa2c7b77e




---


# 6. Appointment Management

### 📌 Creating Appointments
Appointments can be created in two ways:

#### **A. Manually**
1. Go to **Appointments**
2. Click **Add Appointment**
3. Select:
   - Lead(live search) 
   - Service Type 
   - Date + Time  
   - Description  
4. Save the appointment
5. Your Appointment will be sync to your google calender if you have integrated you calender on integration page.

#### **B. Automatically (Chatbot)**

The chatbot accepts:MM/DD/YY H:MM AM/PM
and automatically:

- creates a lead (if not existing)
- converts date/time to ISO format
- books appointment  
- syncs with Google Calendar (if enabled from integration page)
#### **C.Details**
- Automatic Reminders for appointments will be sent to leads before 24 Hours of appointment(Twilio integration is must for this).
- Further in appointments you can see convert to job button.
- click on convert to job button.
- You will see all your scheduled appointments
- click on convert.
- your appointments will be converted to job.

### See demo:



https://github.com/user-attachments/assets/db6ea83e-503c-449b-9f3c-53b76716c27c



---

# 7. Job

📌 Go to **Jobs**:

1. You will see all your converted appointments here
2. You can also edit your Jobs from here.

### See demo:



https://github.com/user-attachments/assets/ddedfe6f-d227-4faf-a808-0c9ce51d05e4



---

# 8. Company/chatbot

To add company details and see chatbot:

1. Click on User icon at the bottom of sidebar.
2. Click **My Account**.
3. Go to  **Company**.
4. Enter your domain.
5. you will see a chatbot button.
6. click and chat with your Chatbot.
7. chatbot will automatically create leads and appointments for you.

### See demo:



https://github.com/user-attachments/assets/24c272e6-d539-4399-9c9f-38e4f2ba6a10




---

# 9. Integration Management 

The **Integrations** module allows you to connect essential third-party services so the CRM can send SMS, sync your appointments to your Google Calendar, and enable the AI chatbot.

### Accessing Integrations

1. Click on the **User Icon** at the bottom-left of the sidebar.  
2. Select **My Account**.  
3. Go to **Integrations**.  

You will see the following three integration cards:

---

### 🔗 A. Google Calendar Integration

This allows Roofbot CRM to automatically sync appointments created manually or through the chatbot.

**Steps to Connect Google Calendar**

1. Click **Connect Google Calendar**.  
2. You will be redirected to Google’s Secure OAuth page.  
3. Select your Google account.  
4. Grant access to your Calendar.  
5. You’ll be redirected back to the CRM with integration success.

**What Google Integration Enables**

- Auto-sync appointments created inside CRM.  
- Auto-sync appointments created by the chatbot.  
- View events directly in your Google Calendar.  
- Maintain a unified schedule across CRM + Google Calendar.  

---

### 📞 B. Twilio SMS Integration

This integration enables all SMS features inside the CRM:

- Automatic SMS on lead creation  
- Follow-up SMS based on lead status  
- Appointment reminders (24 hours before)  
- Two-way SMS (reply-to-chat) inside Lead Page  
- Message Delivery Status (Sent → Delivered → Failed)  

**Steps to Integrate Twilio**

1. Click **Connect Twilio**.  
2. Enter:  
   - Twilio SID  
   - Twilio Auth Token  
3. Click **Save**.  

**After Saving – Important Twilio Setup**

You must configure your Twilio Messaging Service:

1. **Create a Messaging Service**  
   - Go to your Twilio Dashboard → Messaging → Services  
   - Click **Create Messaging Service**  
2. **Add Your Twilio Phone Number**  
   - Under Sender Pool, add your purchased Twilio number  
3. **Configure Webhooks**  
   - Inside your Messaging Service → Integration tab  
   - Under "Send a webhook":  
     - **Request URL (Inbound Messages Webhook)** → Used to receive incoming SMS from Leads  
     - **Delivery Status Callback URL (Delivery Status Webhook)** → Used to update message status (Sent → Delivered → Failed)  

> Both URLs will be shown clearly inside CRM on the Twilio integration card when you click save after entering Sid and token. Just copy/paste them in url's.

### See demo:



https://github.com/user-attachments/assets/4c77ec32-c87b-445f-8ecf-b8e309f6c85c



---

### 🤖 C. GPT / AI Chatbot Integration

This enables the chatbot that:
  
- Collects lead information
- Create lead
- Books appointments  
- Performs natural language conversations  
- Automatically updates lead details  

**Steps to Integrate OpenAi**

1. Click **Connect OpenAi** on the third card.  
2. Enter your **OpenAI API Key**.  
3. Click **Save**.  

**What This Integration Enables**

- AI Chatbot on your website  
- Automatic lead creation via chatbot  
- Automatic appointment booking  
- Smart conversation  
- Lead summarization (AI-powered)  

---

### 🧩 What Happens After All 3 Integrations Are Connected

Your CRM will be fully automated:

1. **When a lead is created**  
   - CRM sends an automatic SMS  
   - Lead is stored
   - Two way messaging with lead
   - Message status update 

2. **When appointments are created**  
   - Automatically sync to Google Calendar  
   - Auto-reminder sent 24 hours before via SMS  

3. **When customers reply via SMS**  
   - Twilio sends webhook → CRM → lead chat updates instantly  
   - Message shows: Sent → Delivered → Failed  

4. **When users chat with the AI chatbot**  
   - GPT processes the request  
   - CRM creates lead  
   - CRM books appointment  
   - CRM updates lead details  
   - Calendar sync happens automatically

---

# 🎉 You Are All Set!

If you need further Assistance, Feel free to contact the development team.
