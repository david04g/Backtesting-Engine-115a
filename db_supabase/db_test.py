import db_util
import db_level_user_progress_util

#print(db_util.delete_user_by_username("time_test"))
#print(type(db_util.get_user_id_by_username("pfp_test2")))

#print(db_level_user_progress_util.add_learning_user(1))
#print(db_level_user_progress_util.add_learning_user(14, 1, 1))

"""
print(db_level_user_progress_util.increment_user_level(14))
print(db_level_user_progress_util.increment_user_lesson(14))
print(db_level_user_progress_util.increment_user_level(1))
print(db_level_user_progress_util.increment_user_lesson(1))
print(db_level_user_progress_util.reset_user_level(14))
"""
print(db_level_user_progress_util.increment_user_lesson_and_reset_user_level(14))
print("\n--delim--\n")
print(db_level_user_progress_util.increment_user_lesson_and_reset_user_level(1))