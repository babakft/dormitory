# Dormitory Management System

🏢 **website:** [www.dormitoryplus.ir](http://www.dormitoryplus.ir)

**(The UI/UX is not optimized at all and its completely handled by ai becuase the real interface and UI/UX is in persian brach which is in persian)**

A comprehensive dormitory management platform built with Django, featuring real-time communication, complex workflow automation, and multi-role authentication systems.

## What This System Does

**DormitoryPlus** is a complete digital solution for managing university dormitory operations. The system handles the entire lifecycle from student registration to maintenance completion:

### Core Functionality:
- **Student Lifecycle Management**: Automated registration → email verification → admin approval → room assignment
- **Maintenance Request System**: Students submit requests → admin approval with priority setting → expert assignment → work completion → student rating
- **Real-time Support**: WebSocket-powered chat system for immediate assistance
- **Service Expert Operations**: Specialized worker portal with task claiming, progress tracking, and completion documentation
- **Automated Notifications**: Email alerts for every workflow stage change
- **Performance Analytics**: Rating systems and workload management for service quality

## Backend Architecture & Technical Features

### 🔐 **Custom Authentication Systems**
- **Multi-Backend Authentication**: Students login with 9-digit student numbers, service experts with employee IDs
- **Role-Based Access Control**: Granular permissions across student/expert/admin roles
- **Custom User Model**: Extended Django user with dormitory-specific fields and validation

### 🔄 **Real-time Communication (WebSocket)**
- **Django Channels Integration**: Full-duplex communication for instant messaging
- **Multi-Room Support**: Isolated chat rooms per support ticket
- **Message Persistence**: Complete chat history with conversation tracking
- **Connection State Management**: Automatic reconnection and message queuing

### ⚡ **Async Task Processing (Celery)**
- **Email Notification Pipeline**: Non-blocking email delivery with retry logic
- **Background Job Management**: Registration confirmations, status updates, password resets
- **Task Retry Mechanisms**: Robust error handling with exponential backoff

### 🗄️ **Complex Database Architecture**
- **Multi-App Structure**: 5 interconnected Django apps with shared models
- **Advanced Relationships**: Foreign keys, many-to-many, and one-to-one relationships
- **Data Integrity**: Database constraints and validation at model level
- **Optimized Queries**: Select_related and prefetch_related for performance

### 🛠️ **Advanced Admin Interface**
- **Custom Admin Actions**: Bulk operations for student approval, password resets
- **Workflow Automation**: Status change triggers with email notifications
- **Data Visualization**: Statistics, ratings, and workload displays
- **Permission Management**: Role-specific admin access controls

### 📧 **Email Service Architecture**
- **Async Email System**: Celery-powered background email processing
- **Template Engine**: Dynamic email content based on user actions
- **Delivery Tracking**: Failed email logging and retry mechanisms
- **Multi-Event Triggers**: Registration, approval, status changes, completions

## Screenshots

### Admin Panels
![Admin Chat Dashboard](https://uploadkon.ir/uploads/61f315_25admin-chat.png)
![Admin Dashboard](https://uploadkon.ir/uploads/c19815_25Admin-panel.png)
![Admin Action](https://uploadkon.ir/uploads/f47e15_25admin-action.png)


### Real-time Communication(Ticket)
![Chat System](https://uploadkon.ir/uploads/0ce715_25ticket-chat.png)
![Chat System](https://uploadkon.ir/uploads/307415_25tikectcreation.png)

### Maintenance Creation
![Maintenance Dashboard](https://uploadkon.ir/uploads/529015_25maintenance-creation.png)
![Maintenance Dashboard](https://uploadkon.ir/uploads/c4a415_25maintenance-detail.png)
![Maintenance Dashboard](https://uploadkon.ir/uploads/374a15_25Rating.png)



### Service Expert Portal
![Expert Dashboard](https://uploadkon.ir/uploads/95d715_25Service-dashboard.png)


### Student Interface
![Student Dashboard](https://uploadkon.ir/uploads/b31815_25student-dashboard.png)


## Technology Stack

### Backend Core
- **Django 5.2+** - Web framework with custom user model
- **PostgreSQL** - Primary database with complex relationships
- **Django Channels** - WebSocket support for real-time features
- **Celery** - Async task queue for background processing
- **Redis** - Message broker and caching layer

### Authentication & Security
- **Custom Authentication Backends** - Multi-format login support
- **Django Signals** - Automated workflow triggers
- **CSRF Protection** - Security for form submissions
- **Session Management** - Custom session handling with remember-me

### Communication & Notifications
- **SMTP Integration** - Email delivery system
- **WebSocket Consumers** - Real-time message handling
- **Template Engine** - Dynamic content generation

## User Guides

### For Students

#### 1. Registration Process
- Create account with student number (9 digits)
- Verify email address via confirmation link
- Wait for admin approval and room assignment

#### 2. Submitting Maintenance Requests
- Navigate to maintenance section
- Fill request form with issue details and photo
- Select specific location (room/building)
- Track request status in real-time

#### 3. Using Support Chat
- Create support tickets for general inquiries
- Engage in real-time chat with admin staff
- Get immediate responses for urgent matters

#### 4. Rating Completed Work
- Receive notification when work is completed
- Rate service quality (1-5 stars)
- Provide feedback for service improvement

### For Service Experts

#### 1. Account Access
- Login with employee ID and password
- View personal dashboard with work statistics

#### 2. Claiming Work
- Browse available requests matching your specialization
- Claim requests to add them to your workload
- View request details and student information

#### 3. Work Progress Management
- Start work and add initial notes
- Update status to "in progress"
- Complete work with final notes and photo evidence

#### 4. Performance Tracking
- View completed work history
- Monitor average rating from students
- Track workload and productivity metrics

### For Administrators

#### 1. Student Management
- Review pending student registrations
- Approve/reject applications with reasons
- Manage room assignments and capacity

#### 2. Maintenance Request Oversight
- Review and approve maintenance requests
- Set priority levels (low/medium/high)
- Monitor expert assignments and progress

#### 3. Support Chat Management
- Respond to student inquiries in real-time
- Access complete chat history
- Close resolved tickets

#### 4. System Administration
- Manage service expert accounts
- Monitor system performance and statistics
- Handle bulk operations for users

---

**Note**: This is a production system designed for real dormitory management operations. The live demo showcases the complete functionality and backend architecture described above.
