import db_util

result = db_util.add_user("test_user", "test@example.com", "pass_hash_123")
print(f"Result: {result}")

result = db_util.get_user_by_id(2)
print(f"Result: {result}")

db_util.delete_user_by_id(2)