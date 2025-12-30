function*e(i){switch(i.type){case"object-id":case"unique-id-simple":return void(yield i.fieldName);case"unique-id-composite":return void(yield*i.fieldNames)}}export{e as i};
