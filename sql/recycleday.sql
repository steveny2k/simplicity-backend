INSERT INTO gisowner.coa_overlay_data_cache_hold (SELECT DISTINCT civx.civicaddress_id, :overlaytype::varchar(150) as type, :distance:: numeric(38,8) as distance, (SELECT string_agg(tp,',')::text FROM (SELECT (b.recday || ' (Recycle Week ' || b.recdistrict || ')')::text as tp FROM gisowner.coa_opendata_sanitation_districts_hold b WHERE st_intersects(b.shape,addr.shape) ) as hold)::text as data FROM gisowner.coa_opendata_property_hold as a LEFT JOIN gisowner.coa_civicaddress_pinnum_centerline_xref_view_hold as civx ON civx.pinnum = a.pinnum LEFT JOIN gisowner.coa_opendata_address_hold as addr ON addr.civicaddress_id = civx.civicaddress_id WHERE addr.civicaddress_id in (SELECT civicaddress_id FROM gisowner.coa_opendata_address_hold ORDER BY civicaddress_id LIMIT :offset OFFSET :record));