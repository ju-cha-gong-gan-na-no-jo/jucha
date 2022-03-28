main:
	docker exec -it mysql_db bash
	

wp:
	docker exec -it wp bash

create:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/create.sql

drop:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/drop.sql

show:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/show.sql

add:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/add.sql

select:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/select.sql

auto:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/drop.sql
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/create.sql
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/add.sql
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/select.sql

temp:
	docker exec -i mysql_db mysql --login-path=root member_db < db/sql/temp.sql

app:
	node ./app.js

backup:
	./backup.js
