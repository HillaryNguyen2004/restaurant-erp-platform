# Software-Architecture-252
This is a comprehensive event-driven service-based system for streamlining restaurant operations.\
The central premise of the system is for basic operations of medium-sized restaurants, which includes:
<ul>
 <li>
   User Management: authentication, authorization, profile management for individuals of the system.
 </li>
 <li>
   Table Reservation and Management: booking management, reservation, table state management.
 </li>
 <li>
   Order and Menu Management: menu browsing, menu item management, order session handling, order placement, and order status tracking.
 </li>
 <li>
   Kitchen Operation Management: kitchen station routing, kitchen ticket generation, ticket status updates, and kitchen display support.
 </li>
 <li>
   Billing and Payment Management: bill generation, payment processing, receipt handling, and payment status tracking.
 </li>
 <li>
   Inventory Management: ingredient stock tracking, inventory deduction based on orders, low-stock alerts,waste management, recipe repository and supplier restocking support.
 </li>
 <li>
  Administration: role-based (attribute-based in the future) policies, staff management, reports, staff analytics.
 </li>
 <li>
Analytics: sales reports, reservation statistics, operational analytics, order trends, kitchen performance metrics.
 </li>
</ul>
  Moreover, we also include these requirements for the system:
  <ul>
 <li>
   Realtime Communication: event-driven updates between services using Kafka and WebSocket-based notifications for frontend clients.
 </li>
 <li>
   API Gateway Integration: centralized routing through Kong Gateway for service access and frontend communication.
 </li>
 <li>
   Frontend Interface: role-based interfaces for servers, kitchen staff, cashiers, customers, and administrators.
 </li>
    <li>
      Clean Architecture: highly-decoupled, extensible and scalable system architecture based on the hexagonal architecture pattern for each of the 8 services.
    </li>
    <li>
      Packaging and Deployment: fully dockerized and battle-tested for deployment.
    </li>
</ul>
