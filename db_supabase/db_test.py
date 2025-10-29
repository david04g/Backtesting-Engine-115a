import db_util

#print(db_util.delete_user_by_username("time_test"))
#print(type(db_util.get_user_id_by_username("pfp_test2")))
print(db_util.add_user("test_test", "test56787654@gmail.com", "test1"))
uid = db_util.get_user_id_by_username("test_test")
print(db_util.verify_password(uid, "test2"))
print(db_util.verify_password(uid, "test1"))