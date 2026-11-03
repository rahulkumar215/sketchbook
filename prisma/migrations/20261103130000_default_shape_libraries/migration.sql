-- The 15 shape libraries that used to ship in public/libraries, now
-- ordinary added libraries (removable from the Shape libraries page).
-- Sources: libraries.excalidraw.com (MIT). An existing URL is skipped.
--
-- created_at is set explicitly in UTC: the column is a timestamp WITHOUT
-- time zone that Prisma reads as UTC, while the column default
-- (CURRENT_TIMESTAMP) would store the server's local time.
INSERT INTO "shape_libraries" ("id", "url", "name", "created_at")
SELECT gen_random_uuid(), v.url, v.name, now() AT TIME ZONE 'UTC'
FROM (
    VALUES
        ('https://libraries.excalidraw.com/libraries/anna-pastushko/architecture-diagram-components.excalidrawlib', 'architecture-diagram-components'),
        ('https://libraries.excalidraw.com/libraries/ferminrp/awesome-icons.excalidrawlib', 'awesome-icons'),
        ('https://libraries.excalidraw.com/libraries/childishgirl/aws-architecture-icons.excalidrawlib', 'aws-architecture-icons'),
        ('https://libraries.excalidraw.com/libraries/cloud/cloud.excalidrawlib', 'cloud'),
        ('https://libraries.excalidraw.com/libraries/ei-au/computers.excalidrawlib', 'computers'),
        ('https://libraries.excalidraw.com/libraries/dbssticky/data-viz.excalidrawlib', 'data-viz'),
        ('https://libraries.excalidraw.com/libraries/aretecode/decision-flow-control.excalidrawlib', 'decision-flow-control'),
        ('https://libraries.excalidraw.com/libraries/markopolo123/dev_ops.excalidrawlib', 'dev_ops'),
        ('https://libraries.excalidraw.com/libraries/drwnio/drwnio.excalidrawlib', 'drwnio'),
        ('https://libraries.excalidraw.com/libraries/g-script/forms.excalidrawlib', 'forms'),
        ('https://libraries.excalidraw.com/libraries/spfr/lo-fi-wireframing-kit.excalidrawlib', 'lo-fi-wireframing-kit'),
        ('https://libraries.excalidraw.com/libraries/youritjang/software-architecture.excalidrawlib', 'software-architecture'),
        ('https://libraries.excalidraw.com/libraries/youritjang/stick-figures.excalidrawlib', 'stick-figures'),
        ('https://libraries.excalidraw.com/libraries/rohanp/system-design.excalidrawlib', 'system-design'),
        ('https://libraries.excalidraw.com/libraries/arach/systems-design-components.excalidrawlib', 'systems-design-components')
) AS v(url, name)
ON CONFLICT ("url") DO NOTHING;
