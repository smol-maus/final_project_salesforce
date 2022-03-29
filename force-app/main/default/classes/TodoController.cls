public with sharing class TodoController {

    @AuraEnabled(cacheable=true)
    public static Map<String, List<SubTodo__c>> getTodoMap() {
        Todo__c[] todos = [SELECT
                            Id,
                            Name,
                            RecordTypeId,
                            Status__c,
                            RecordType.Name,
                            CreatedDate,
                            Description__c
                        FROM Todo__c
                        WITH SECURITY_ENFORCED
                        ORDER BY Status__c
                        LIMIT 50
                        ];

        return putSubtodos(todos);
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, List<SubTodo__c>> getSearchedMap(String searchKey) {
        String key = '%' + searchKey + '%';
        Todo__c[] todos = [SELECT
                            Id,
                            Name,
                            RecordTypeId,
                            Status__c,
                            RecordType.Name,
                            CreatedDate,
                            Description__c
                        FROM Todo__c
                        WHERE Name LIKE :key
                        WITH SECURITY_ENFORCED
                        ORDER BY Status__c
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

    }
}
