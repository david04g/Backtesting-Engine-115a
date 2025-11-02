# Supabase Management Functions
Libraries Needed:
-Default Python Libraries
-dotenv
-imghdr
-bcrypt
-supabase (2.0.0 or newer)

The extra libraries needed should be added in the requirements.txt file.


## Functions Overview:
### Account Creation and Login
**add_user(username: str, email: str, password_plain: str)**
Takes in a username, email, and password in that order. Returns a dict consisting of two keys. The first key will have the value True if the user was able to be added and False if the user was not able to be added. If the user was successfully able to be added, then the second key will read 'user' with the value of the user's id (is incremented by 1 for each created user from 0), username, email, password hash, account creation time (will be based on UTC-0 time), profile image link (should always be the default profile picture link), their email verification status (should always be false), and their verification token. If the account creation was not successful, the second key will read 'message' with a value of the error it ran into. If successful, the function will add the user's information to the database with the input username, email, and hashed password, as well as an account creation time, a default profile image link, a generated verification token, and and the email_verified flag being set to false.

**login_user(email, password_plain)**
Takes in an email and a plain password. Will return a dictionary with two key-value pairs. The first key will read 'success', with a value of True if the credentials are correct and the user should be logged in and False otherwise. If true, the second key will read 'user' and return the same user information as is listed in add_user(). If False, the second key will read 'message' and give a reason as to why the user was not able to be logged in.

### Queries
**get_user_by_id(uid: int)**
Takes in a user id as an int and returns a dictionary with the user's id, username, email, password hash, account creation time, profile image link, their email verification status, and their verification token.

**get_user_by_username(username: str)**
Takes in a username as a string and returns a dictionary with the user's id, username, email, password hash, account creation time, profile image link, their email verification status, and their verification token.

**get_all_users()**
Does not take any inputs. When called, returns a list of dictionaries with each dictionary containing the user's id, username, email, password hash, account creation time, profile image link, their email verification status, and their verification token.

**get_user_id_by_username(username: str)**
Takes in a username as a string and reutnrs an int of the user's id. 

### Account Deletion
**delete_user_by_username(username: str)**
Takes in a username as a string and removes that user's information from the database. Will return True if the user was succesfully deleted, and False otherwise.

**delete_user_by_id(uid: int)**
Takes in a user id as an int and removes that user's information from the database. Will return True if the user was succesfully deleted, and False otherwise.

### Profile picture modification
**is_image_file(path: str)**
Helper function for upload_profile_picture_by_user_id(). Takes in a file path as a string. Returns True if the file is a jpeg or png. Returns False otherwise.

**upload_profile_picture_by_user_id(uid: int, file_path: str)**
Takes in a user id as an int and a file path as a string. If the filepath from upload is valid and the image is a jpeg or a png, the file will be uploaded to the data bucket "profile-pictures" and the user's. The function will then return the public url that leads to that file in the supabase bucket and the user's "profile_image" column will be changed to the public url. 

### Password management
**verify_password(uid: int, password_attempt: str) -> bool**
Takes in a uid as an int and a plain password as a string. Returns True if the password matches the user id, False otherwise.

**change_password(uid: int, old_password: str, new_password: str) -> bool**
Takes in a uid as an int, the user's old plain password as a string, and the new desired plain password as a string. Returns False if the old plain password was incorrect or the password was unable to be changed. Returns True otherwise. 

### Email verification
**send_verification_email(email, verification_link)**
Takes in an email and a verification link, both as a string. Sends a simple verification email to the given email. 

**verify_email(token: str)**
Takes a token as a string. If the given token matches the token of a user, that user's value in the "Verified" column becomes True.