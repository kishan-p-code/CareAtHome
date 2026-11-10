import random
import string
from datetime import datetime

def generate_booking_code() -> str:
    year = datetime.utcnow().year
    rand_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"CAH-{year}-{rand_chars}"

def generate_sample_barcode() -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    rand_num = random.randint(1000, 9999)
    return f"SMPL-{date_str}-{rand_num}"

def calculate_discount(subtotal: float, coupon) -> float:
    if not coupon or not coupon.is_active:
        return 0.0
    if subtotal < coupon.min_order_amount:
        return 0.0
    
    discount = 0.0
    if coupon.discount_percent > 0:
        discount = (subtotal * coupon.discount_percent) / 100.0
    elif coupon.flat_discount > 0:
        discount = coupon.flat_discount
        
    return min(discount, coupon.max_discount_cap, subtotal)

