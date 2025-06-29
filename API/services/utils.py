from dateutil.relativedelta import relativedelta
from datetime import timedelta

def parse_period(period: str):
    if period.endswith("d"):
        return timedelta(days=int(period[:-1]))
    elif period.endswith("w"):
        return timedelta(weeks=int(period[:-1]))
    elif period.endswith("m"):
        return relativedelta(months=int(period[:-1]))
    elif period.endswith("y"):
        return relativedelta(years=int(period[:-1]))
