public with sharing class TodoController {

    final static String master = 'Master';
    final static String expired = 'Expired';

    @AuraEnabled(cacheable=true)
    public static Map<String, List<SubTodo__c>> getTodoMap() {
        Todo__c[] todos = [SELECT
                            Id,
                            Name,
                            RecordTypeId,
                            Status__c,
                            RecordType.Name,
                            CreatedDate,
                            Description__c,
                            Owner.Name
                        FROM Todo__c
                        WITH SECURITY_ENFORCED
                        ORDER BY CreatedDate DESC
                        LIMIT 50
                        ];

        SubTodo__c[] subTodos = [SELECT Id, Name, Done__c, Master__c FROM SubTodo__c WITH SECURITY_ENFORCED LIMIT 50];

        Map<String, List<SubTodo__c>> todoMap = new Map<String, List<SubTodo__c>>();
        for (Todo__c todo : todos){
            List<SubTodo__c> subList = new List<SubTodo__c>();
            for (SubTodo__c sub : subTodos)
                if (sub.Master__c == todo.Id){
                    subList.add(sub);
            }
            todoMap.put(JSON.serialize(todo), subList);
        }
        return todoMap;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getRecordTypes() {
        Schema.DescribeSObjectResult R = Todo__c.getSObjectType().getDescribe();
        List<Schema.RecordTypeInfo> RT = R.getRecordTypeInfos();

        Map<String, String> recordTypesList = new Map<String, String>();

        for (Schema.RecordTypeInfo current : RT){
            if(current.developername != expired && current.developername != master) {
                recordTypesList.put(current.developername, current.recordtypeid);
            }
        }
        return recordTypesList;
    }

/*     @AuraEnabled(cacheable=false)
    public static Map<String, List<SubTodo__c>> getSearchedMap(String searchKey) {
        String key = '%' + searchKey + '%';
        Todo__c[] todos = [SELECT
                            Id,
                            Name,
                            RecordTypeId,
                            Status__c,
                            RecordType.Name,
                            CreatedDate,
                            Description__c,
                            Owner.Name
                        FROM Todo__c
                        WHERE Name LIKE :key
                        WITH SECURITY_ENFORCED
                        ORDER BY CreatedDate DESC
                        LIMIT 50
                        ];
    
        return putSubtodos(todos);
    }

    @AuraEnabled(cacheable=false)
    public static Map<String, List<SubTodo__c>> getFullSearchedMap(String searchKey) {

        List<List<SObject>> soslSearched = [FIND :searchKey IN ALL FIELDS RETURNING Todo__c (Id), Subtodo__c(Master__c)];

        List<Id> todoIds = new List<Id>();
        for(Todo__c todo : ((List<Todo__c>)soslSearched[0])){
            todoIds.add(todo.Id);
        }
        for(SubTodo__c sub : ((List<SubTodo__c>)soslSearched[1])){
            todoIds.add(sub.Master__c);
        }

        Todo__c[] todos = [SELECT
                            Id,
                            Name,
                            RecordTypeId,
                            Status__c,
                            RecordType.Name,
                            CreatedDate,
                            Description__c,
                            Owner.Name
                        FROM Todo__c
                        WHERE Id IN : todoIds
                        WITH SECURITY_ENFORCED
                        ORDER BY CreatedDate DESC
                        LIMIT 50
                        ];


        return putSubtodos(todos);
    }

    private static Map<String, List<SubTodo__c>> putSubtodos(Todo__c[] todos){
        SubTodo__c[] subTodos = [SELECT Id, Name, Done__c, Master__c FROM SubTodo__c WITH SECURITY_ENFORCED LIMIT 50];
        
        Map<String, List<SubTodo__c>> todoMap = new Map<String, List<SubTodo__c>>();
        for (Todo__c todo : todos){
            List<SubTodo__c> subList = new List<SubTodo__c>();
            for (SubTodo__c sub : subTodos)
                if (sub.Master__c == todo.Id){
                    subList.add(sub);
            }
            todoMap.put(JSON.serialize(todo), subList);
        }
        return todoMap;
    } */
}
