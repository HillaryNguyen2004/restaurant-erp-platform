
# Functional Requirements

## User Management
### Stakeholders:  
Managers, Servers, Kitchen Staff, Cashiers
### Description: 
This domain allows for the management of authentication, authorization and profile management of every staff of the system
## Features:
* Login/Logout: The system must allow for all users to perform login using both email-password and logout of the system when needed.
* Password Reset: The System must allow for users to reset their password through emails by sending a 6-digit verification code to authorize reset request.
* User Creation: The System must allow Managers to create new users when a new employee has joined the restaurant, with respect to their assigned role.
* Authorization: The System functions as a central authorization gateway using Role-based Access Control, only allocating information and resource correctly to the user's role.
* Profile Viewing: The System must allow every user to retrieve their profile information, including: First Name & Last Name, Email, Phone Number(s), Role, Logs.
* Profile Modification: The System must allow every user to modify or add information of their profile, Managers must also be notified in case of users' profile changes.
// Họ không có 1 administrator, quản lý server, nó không trong scope của bài.
* Profile Monitoring: The System must allow the Managers to view the history (or logs) of all the changes each users made to their

// co-existent : lưu ý là, tích hợp được với paypal, credit card, hoặc stripe, in other words, learn about the apis : )

## Kitchen Operation
### Stakeholder: 
Kitchen Staff, Servers
### Description: 
This domain allows for kitchen staff to manage customers' orders and enhance coordination in the kitchen.
### Features:
* Real-time Order Tracking: The System must allow for kitchen staff to keep track of the orders by viewing and updating their state(Started, Cooking, Ready-To-Serve). Whenever an order changes its state, a timestamp should be recorded, and the system must also record the remaining time for each order to be prepared.
* Order Notification: The System must notify each staff when orders are nearing deadlines (in 1-3 minutes prior) or when new orders arrive.
* Kitchen Display System: The System must updates metadata of the orders (remaining time, states, table id, prep time, dish type) in realtime for the Servers to see and coordinate accordingly.

## Digital Ordering
### Stakeholders: 
Servers, Managers
### Description:
This domain allows for servers to register customers' orders to the system, as well as for servers and managers to managing orders and the menu of the restaurant.
### Features:
* Order Registration: The system must allow for the servers to enter new orders with appropriate information: Table Id, Dishes metadata (type, number of servings, notes), cash amount.
* Order Management: The system must allow for the servers and the managers to view and updates the orders, including the states (Waiting, In Progress, Done, Cancelled) and the history for each of the orders.
* Menu Monitoring: The system must allow for the servers to view the real-time changes of the menu, including the states of each items (unavailable, available) as well as the prices and their changes (discounts, price increases).
* Menu Management: The system must allow for the servers and managers to add new menu items, modify description (allergy notes, specialties) as well as permannently removing items, and adding combos and special offers.




## Table and Reservation Management
### Stakeholders:
Servers, Cashiers, Managers
### Description:
This domain allows for servers to schedule and manage table bookings, monitor live occupancy, and track service durations. It also enables cashiers to keep track of each table's current billing readiness and occupancy status.
### Features:
* Reservation Scheduling: The system must allow for servers to schedule a reserved table for customers, including the option to extend the duration or cancel reservations across a multi-day calendar.
* Reservation Monitoring: The system must allow for the overseeing of every reservation in real time, displaying all necessary attributes such as reservation status (e.g., Confirmed, Arrived, No-show), scheduled service time, and current billing status.
* Table State Management: The system must provide servers with a real-time view of each table’s state, specifically identifying if a table is Reserved, Free, or Out-of-order.
* Service Time Tracking: The system must track and display the remaining service time for each occupied table, allowing servers to estimate turnover and manage customer flow effectively.
* Live Table Price Tracking: The system must provide the cashier a intuitive and real-time view of each table's current price, as well as their final price and the ability to manage them.

## Administration
### Stakeholders:
Managers
### Description:
This domain serves allows for managers to oversee and manage user permissions, oversee system-wide configurations, and maintain accountability through detailed activity logs.
### Features:

* Access Control: The system must allow for role-based access control to define and manage specific permissions for different user roles: managers, servers, kitchen staff, and cashiers.

* Admin Logs: The system must provide audit logs that track and record critical administrative actions, such as order cancellations, refunds, and price overrides, including the user ID and timestamp.


## Analytics
### Stakeholders:

Managers, Cashiers

### Description:

This domain allows for the processing of operational and financial data into actionable insights, enabling managers to evaluate restaurant performance and cashiers to monitor daily sales targets.

### Features:

* Sales Analytics: The system must allow for the managers and cashiers to view the financial performance of the restaurant through daily statistics, including peak hours, best-selling items, and total revenues.
(Future Extension: Add Machine Learning  and Data Engineering to predict sales and assess performance)

* Operational Analytics: The system must allow for the managers to monitor operational efficiency by tracking service delays, kitchen bottlenecks, and individual staff performance metrics on a daily basis.

* Analytics Report: The system must allow for the managers to export comprehensive reports in various formats (pdf, xls) for the purposes of accounting, long-term planning, and formal performance reviews.


# Scope
The Intelligient Restaurant Management System (IRMS) is a web-based management system to allow actors operating a restaurant to easily access and use. By utilizing a web-based approach, the system can be accessed from various devices without requiring complex installations, enabling seamless management and automation of various restaurant operations.
IRMS is designed and implemented primarily for medium-scale restaurant, serving around 300 - 500 orders daily and supporting and managing 80 - 120 employees at once.
The IRMS facilitates efficient restaurant operations by automating various modules:

* User Management : Handles the personnel side of the business, managing profiles and credentials for managers, servers, chefs, and cashiers to ensure the right people have the right access.

* Kitchen Operation:  Replaces paper tickets with a digital Kitchen Display System (KDS). It organizes orders by station and prep time, alerts chefs to looming deadlines, and tracks every dish through three stages: Started, Cooking, and Ready to Serve.

* Table Reservation Management: Provides a live digital floor plan to replace the old paper logs. It handles daily bookings and allows servers to monitor table occupancy, service times, and whether a table is Free, Reserved, or Out-of-order in real time.

* Digital Ordering & Menu: Serves as the primary interface for staff to take orders quickly. It supports complex customizations like allergy notes and combo selections, while allowing the menu to be updated instantly (e.g., marking an item as "unavailable") across all terminals.

* Billing Management: Streamlines the transactions at the end of a meal. It automatically combines orders and service fees into a single bill, handles split-check requests, manages tips, and accepts various payments including cash, cards, bank transfers and digital wallets.

* Inventory Monitoring – Keeps the pantry stocked by automatically counting down ingredients as meals are served. It pings managers when stock hits a "low" threshold and uses historical data to help predict exactly how much to reorder for the following week.

* Analytics – Turns daily data into actionable insights. Managers can view financial performance through peak-hour stats and revenue reports, or look at operational analytics to spot kitchen bottlenecks and evaluate staff efficiency.

* Administration – Serves as the system's control center. Managers use this to centrally update prices or launch promos and review audit logs that track every sensitive action, such as a refund or a cancelled order, for full accountability.




Thay đổi nhỏ: 
  Mình chuyển qua dùng Go: Why? Go dùng rất nhiều cho microservice, nhiều cái thao tác go ko có abstract lại, nên dễ và phù hợp cho việc học và sử dụng trong môi trường microservice. 
  Mình k mặn mà với dotnet như mk nghĩ : )
  Kỳ vs Hoa (nếu có làm), thì sẽ làm NestJS
