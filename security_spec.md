# Firestore Security Specification - ASTRA NEXUS

## 1. Data Invariants
- **Customers**: Any authenticated user can create a customer. Only admins or the creator (if we had a creator field) can read/update. *Correction*: For this app, all staff (authenticated users) share the database. So any authenticated user can read/write customers.
- **Orders**: Must belong to a valid customer.
- **Subscriptions**: Must belong to a valid customer.
- **Products**: Read-only for most users, editable by admins.
- **Users**: User profiles for staff.

## 2. The "Dirty Dozen" Payloads (Deny Targets)

1. **Anonymous Write**: Attempt to create a customer without being logged in.
2. **ID Poisoning**: Create a customer with a 2MB string as ID.
3. **Ghost Field**: Update an order with `isSystemAdmin: true`.
4. **Invalid Type**: Set `price` to a string `"free"`.
5. **PII Leak**: Unauthenticated user trying to list all customers.
6. **Immutable Breach**: Trying to change `createdAt` on an existing order.
7. **Orphaned Order**: Creating an order for a `customerId` that doesn't exist.
8. **Status Skip**: Updating an order status from `open` to `delivered` bypassing `in-progress`.
9. **Role Escalation**: A user trying to update their own role to `admin` in the `users` collection.
10. **Resource Exhaustion**: Sending a notes string of 1MB.
11. **Spoofed Auth**: Request with `auth.token.email_verified == false` (if we enforce verification).
12. **Batch Inconsistency**: Creating an order without updating the customer's `lastOrderAt` (if required).

## 3. Implementation Strategy
- Use `isValidId()` for all path IDs.
- Use `isValidCustomer()`, `isValidOrder()`, etc.
- Enforce `request.auth != null`.
- Enforce `request.auth.token.email_verified == true`.
