date=`date +%d-%m-%Y`

node simplicity-backend.js -d config/db.yml -m config/maintenance.yml >> log/maintenance_$date.log
node simplicity-backend.js -d config/db.yml -c config/buildcache.yml >> log/buildcache_$date.log
node simplicity-backend.js -d config/db.yml -m config/maintenance_afterbuild.yml >> log/maintenance_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_address.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_buffer.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_cache.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_citylimits.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_crime.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_crossref.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_neighborhoods.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_permits.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_property.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_sanitationdistricts.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_streetazimuthal.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_streets.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_zoning.yml >> log/datatest_$date.log
node simplicity-backend.js -d config/db.yml -t config/datatests_zoningoverlays.yml >> log/datatest_$date.log