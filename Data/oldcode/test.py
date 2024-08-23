import dis
import time


list_of_items = ["item1", "item2", "item3"]
dict_obj = {}

def function1():
    list_of_items = ["item1", "item2", "item3"]
    dict_obj = {}
    dict_obj["item1"] = list_of_items[0]
    dict_obj["item2"] = list_of_items[1]
    dict_obj["item3"] = list_of_items[2]

def function2():
    list_of_items = ["item1", "item2", "item3"]
    dict_obj = {}
    dict_obj.update({
        "item1": list_of_items[0],
        "item2": list_of_items[1],
        "item3": list_of_items[2]
    })

high_end = 100_000

range_numbers = range(0, high_end)
time_item = 0

for _ in range_numbers:

    prev_time = time.time()
    
    for _ in range_numbers:
        function2()
    time_item += time.time() - prev_time
    
print(time_item/high_end)