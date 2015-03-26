INSERT INTO gisowner.coa_overlay_data_cache_hold (SELECT DISTINCT avw.civicaddress_id, :overlaytype::varchar(150) as type, avw.distance as distance, (SELECT string_agg(tp,',')::text FROM (SELECT b.pid::text as tp FROM gisowner.coa_opendata_crime_hold b WHERE st_contains(avw.shape,b.shape )) as hold)::text as data,''::text datajson FROM gisowner.coa_address_buffers_cache_hold AS avw LEFT JOIN gisowner.coa_address_buffers_cache_hold buf ON buf.civicaddress_id = avw.civicaddress_id LEFT JOIN gisowner.coa_opendata_address_hold addr ON addr.civicaddress_id = buf.civicaddress_id WHERE avw.distance = :distance and avw.civicaddress_id in (select civicaddress_id from gisowner.coa_opendata_address_hold order by civicaddress_id limit :offset offset :record))