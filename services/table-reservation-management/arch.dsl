workspace "Restaurant Management System" "A system for managing restaurant operations" {

    model {
        customer = person "Customer" "A customer of the restaurant"
        staff = person "Staff" "Restaurant staff member"
        
        restaurantSystem = softwareSystem "Restaurant Management System" "Manages reservations, orders, and kitchen operations" {
            tags "Software System"
        }
        
        paymentSystem = softwareSystem "Payment System" "Processes payment transactions" {
            tags "Software System"
        }
        
        customer -> restaurantSystem "Makes reservations and places orders"
        staff -> restaurantSystem "Manages operations"
        restaurantSystem -> paymentSystem "Processes payments"
    }

    views {
        systemContext restaurantSystem "SystemContext" {
            include *
            autoLayout
        }

        styles {
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Person" {
                background #08427b
                color #ffffff
            }
        }
    }
}