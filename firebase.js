rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /links/{shortCode} {
    	allow get: if shortCode.size() == 6
    }
    
    
    match /users/{userUid}/links/{link} {
    
    function isOwner() {
      return request.auth != null && request.auth.uid == userUid
    }
    
    function verifyRequiredFields() {
    	let incomingData = request.resource.data;
    	let requiredFields = ['createdAt', 'longURL', 'name', 'shortCode', 'totalClicks'];
    	return incomingData.keys().hasAll(requiredFields) && incomingData.keys().hasOnly(requiredFields)
    }
    
    function verifyFieldTypes() {
    	let incomingData = request.resource.data;
      return incomingData.createdAt is timestamp &&
      				incomingData.longURL is string &&
              incomingData.name is string &&
              incomingData.shortCode is string &&
              incomingData.totalClicks is number;
    }
    
    
    function verifyFieldValues() {
      let incomingData = request.resource.data;
      return incomingData.createdAt == request.time &&
      	 incomingData.name.size() >= 3 && incomingData.name.size() <= 15 &&
         incomingData.totalClicks == 0 &&
         incomingData.longURL.matches("^(ht|f)tp(s?):\\/\\/[0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])*((0-9)*)*(\\/?)([a-zA-Z0-9\\-\\.\\?\\,\\'\\/\\\\+&=%\\$#_]*)?$") &&
         incomingData.shortCode.size() == 6 && !exists(/databases/$(database)/documents/links/$(incomingData.shortCode))
    }
    
    function verifyLinkUpdate() {
       let futureDoc = request.resource.data;
       let currentDoc = resource.data;
       return futureDoc.diff(currentDoc).affectedKeys().hasOnly(['totalClicks']) && futureDoc.totalClicks == currentDoc.totalClicks + 1
    }
    
    
    
    
    allow read: if isOwner() 
    allow delete: if isOwner()
    allow create: if isOwner() && verifyRequiredFields() && verifyFieldTypes() && verifyFieldValues()
    allow update: if verifyLinkUpdate()
    }
    
    
  }
}
