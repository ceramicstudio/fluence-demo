CREATE TABLE is_used
(
    id SERIAL,
    code text,
    used boolean,
);

INSERT INTO is_used(code, used) VALUES
 ('abc123', true);