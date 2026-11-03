-- The 15 shape libraries that used to ship in public/libraries, now
-- ordinary added libraries (removable from the Shape libraries page).
-- Sources: libraries.excalidraw.com (MIT). An existing URL is skipped.
INSERT INTO "shape_libraries" ("id", "url", "name")
VALUES
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/anna-pastushko/architecture-diagram-components.excalidrawlib', 'architecture-diagram-components'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/ferminrp/awesome-icons.excalidrawlib', 'awesome-icons'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/childishgirl/aws-architecture-icons.excalidrawlib', 'aws-architecture-icons'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/cloud/cloud.excalidrawlib', 'cloud'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/ei-au/computers.excalidrawlib', 'computers'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/dbssticky/data-viz.excalidrawlib', 'data-viz'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/aretecode/decision-flow-control.excalidrawlib', 'decision-flow-control'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/markopolo123/dev_ops.excalidrawlib', 'dev_ops'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/drwnio/drwnio.excalidrawlib', 'drwnio'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/g-script/forms.excalidrawlib', 'forms'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/spfr/lo-fi-wireframing-kit.excalidrawlib', 'lo-fi-wireframing-kit'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/youritjang/software-architecture.excalidrawlib', 'software-architecture'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/youritjang/stick-figures.excalidrawlib', 'stick-figures'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/rohanp/system-design.excalidrawlib', 'system-design'),
    (gen_random_uuid(), 'https://libraries.excalidraw.com/libraries/arach/systems-design-components.excalidrawlib', 'systems-design-components')
ON CONFLICT ("url") DO NOTHING;
