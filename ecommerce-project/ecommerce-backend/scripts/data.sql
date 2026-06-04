-- Insert categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Clothing', 'Fashion and apparel'),
  ('Books', 'Books and literature'),
  ('Home & Kitchen', 'Home appliances and kitchenware'),
  ('Sports', 'Sports equipment and fitness gear')
ON CONFLICT DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role, enabled, created_at)
VALUES ('Admin', 'User', 'admin@ecommerce.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyNv68M2.',
        'ADMIN', true, NOW())
ON CONFLICT (email) DO NOTHING;
