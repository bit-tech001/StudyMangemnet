# Firestore Security Specification

## Data Invariants
- A User profile can only be created by the authenticated owner.
- Assignments can only be created and modified by Teachers.
- Exams can only be created and modified by Teachers.
- Submissions belong to a student and refer to a valid task (Assignment/Exam).
- Students can only see their own submissions.
- Teachers can see all submissions for tasks they created.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a user profile with a UID that doesn't match `auth.uid`.
2. Changing the `role` field on a user profile after creation.
3. A student creating an assignment.
4. A teacher modifying an assignment they didn't create.
5. A student modifying an assignment.
6. A student deleting an exam.
7. Creating a submission for another student.
8. Modifying the `marksObtained` field in a submission by a student.
9. Reading all user profiles as a student.
10. Reading another student's assignment submission.
11. Injecting a 2MB string into any text field.
12. Setting a future `createdAt` timestamp from the client.

## Test Cases
- [x] isValidId validation for all document IDs.
- [x] `request.auth.uid` comparison for owner-based writes.
- [x] `role` check via `get()` for teacher-only operations.
- [x] Immutability of key fields during update.
- [x] Server-side timestamp validation.
