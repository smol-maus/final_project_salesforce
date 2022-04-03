@isTest
private class TodoControllerTest {

    @testSetup
    static void setup() {
        TodoTriggerHandler.enableTrigger = false;
        SubTodoTriggerHandler.enableTrigger = false;
        Todo__c todo = new Todo__c(Name = 'test todo', Status__c = 'In progress');
        insert new List<Todo__c> {
            todo, new Todo__c(Name = 'alt test todo', Status__c = 'Done')
        };
        insert new List<SubTodo__c> {
            new SubTodo__c(Name = 'test sub one', Master__c = todo.Id),
            new SubTodo__c(Name = 'test sub two', Master__c = todo.Id)
        };
    }

    @isTest
    static void getMapTest() {
        Map<String, List<SubTodo__c>> todoMap = TodoController.getTodoMap();
        
        System.assertEquals(todoMap.keySet().size(), 2);

        String todoString;
        for (String setElement : todoMap.keySet()) {
            todoString = setElement;
            break;
        }
        Todo__c todo = (Todo__c) JSON.deserialize(todoString, Type.forName('Todo__c'));
        System.assertEquals('test todo', todo.Name);
        SubTodo__c sub = todoMap.values().get(0).get(1);
        System.assertEquals(todo.Id, sub.Master__c);
        System.assertEquals('test sub two', sub.Name);
    }

    @isTest
    static void getSearchedMapTest() {
        Map<String, List<SubTodo__c>> todoMap = TodoController.getSearchedMap('alt');
        
        System.assertEquals(todoMap.keySet().size(), 1);

        String todoString;
        for (String setElement : todoMap.keySet()) {
            todoString = setElement;
            break;
        }
        Todo__c todo = (Todo__c) JSON.deserialize(todoString, Type.forName('Todo__c'));
        System.assertEquals('alt test todo', todo.Name);
    }

    @isTest
    static void getFullSearchedMapTest() {
        Id [] fixedSearchResults= new Id[2];
        SubTodo__c searchedSub = [SELECT Master__c FROM SubTodo__c WHERE Name LIKE '%two%' LIMIT 1];
        fixedSearchResults[0] = searchedSub.Master__c;
        fixedSearchResults[1] = searchedSub.Id;

        Test.startTest();
        Test.setFixedSearchResults(fixedSearchResults);
        Map<String, List<SubTodo__c>> todoMap = TodoController.getFullSearchedMap('two');
        Test.stopTest();
        
        System.assertEquals(1, todoMap.keySet().size());

        String todoString;
        for (String setElement : todoMap.keySet()) {
            todoString = setElement;
            break;
        }
        
        Todo__c todo = (Todo__c) JSON.deserialize(todoString, Type.forName('Todo__c'));
        System.assertEquals('test todo', todo.Name);
        SubTodo__c sub = todoMap.values().get(0).get(0);
        System.assertEquals(todo.Id, sub.Master__c);
        System.assertEquals('test sub one', sub.Name);
    }
}
