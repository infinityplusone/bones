/*
 * Name: <%= name %>.js
 * Description: <%= meta.description %>
 * Dependencies: brain, bone
 * 
 * Author(s): <%= meta.author %>
 * Version:    1.0.2
 * Date:       2016-08-17
 *
 * Notes: 
 *
 *
 */
define([
  'bones/bone/bone',
  'text!./<%= name %>.hbs',
  'brain'
], function(Bone, tmpl) {

  brain.handlebars.addTemplates(tmpl);

  var BoneShape = Bone.create({
    meta: {
      author: '<%=meta.author%>',
      description: '<%=meta.description%>',
      displayName: '<%=title%>'
    },
    type: '<%=name%>'
  });

  return BoneShape;

}); // define
