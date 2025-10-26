import db_util

#db_util.delete_user_by_id(51)
#result = db_util.add_user("pfp_test2", "pfp_test2@gmail.com", "pass_hash_123")
#print(f"Result: {result} \n")

#user_id = result["user"]["id"]
#print(user_id)

#print(new_uid)
#result = db_util.get_user_by_id(2)
#print(f"Result: {result}")

#db_util.delete_user_by_username("pfp_test2")
db_util.upload_profile_picture_by_user_id(61, "/app/26db8e1bc9a0eb238e69ae7d01a24fee.jpg")
#db_util.delete_user_by_id(user_id)
