/**
 * -----------------------------------------------------------------------------
 * file: criteriaBuilder.js
 * file version: 1.0.0
 * date: 2010-05-01
 *
 * JS file provided by the piwigo's plugin "GrumPluginClasses"
 *
 * -----------------------------------------------------------------------------
 * Author     : Grum
 *   email    : grum@piwigo.com
 *   website  : http://photos.grum.fr
 *   PWG user : http://forum.phpwebgallery.net/profile.php?id=3706
 *
 *   << May the Little SpaceFrog be with you ! >>
 * -----------------------------------------------------------------------------
 *
 * -----------------------------------------------------------------------------
 * This plugin use the Nested Sortable Plugin / version 1.0.1
 *    Copyright (c) 2007 Bernardo de Padua dos Santos
 *    Dual licensed under the MIT (MIT-LICENSE.txt)
 *    and GPL (GPL-LICENSE.txt) licenses.
 *
 *    http://code.google.com/p/nestedsortables/
 * -----------------------------------------------------------------------------
 *
 * an object dedicaded for Piwigo, giving easy user methods to make complex
 * requests
 *
 * constructor : myCB = new criteriaBuilder(containerId [, options]);
 *
 *  - containerId : the Id of the DOM element where the criteria will be added
 *  - options : an object with this properties :
 *       . textAND       : String, with default value = 'AND'
 *                         displayed text to indicates the type of operator AND
 *       . textOR        : String, with default value = 'OR',
 *                         displayed text to indicates the type of operator OR
 *       . textHint      : String, with default value = '',
 *       . classGroup    : String, with default value = '',
 *       . classItem     : String, with default value = '',
 *       . classOperator : String, with default value = '',
 *       . classHelper   : String, with default value = 'helper',
 *       . opacity       : String, with default value = 0.8,
 *       . onEdit        : handler on a function to manage click on the 'Edit'
 *                         button ; event.data contain the item Id
 *       . onDelete      : handler on a function to manage click on the 'Delete'
 *                         button ; event.data contain the item Id
 *       . imgEditUrl    : String, with default value = '',
 *       . imgDeleteUrl  : String, with default value = '',
 *
 *
 *
 * :: HISTORY ::
 *
 * | release | date       |
 * | 1.0.0   | 2010/04/27 | start to coding
 * |         |            |
 * |         |            |
 * |         |            |
 * |         |            |
 * |         |            |
 * |         |            |
 *
 */



function criteriaBuilder(container)
{
  var itemsId = {
          group:'iCbGroup',
          item:'iCbItem',
          container:container,
        },
      counters = {
          group:0,
          item:0,
        },
      options = {
          textAND:'AND',
          textOR:'OR',
          textHint:'',
          classGroup:'',
          classItem:'',
          classOperator:'',
          classHelper:'helper',
          opacity:0.8,
          onEdit:null,
          onDelete:null,
          onRequestSuccess:null,
          onRequestError:null,
          onGetPageSuccess:null,
          onGetPageError:null,
          imgEditUrl:'',
          imgDeleteUrl:'',
          ajaxUrl:'',
        },
      extraData = new Array();

  if(arguments.length==2)
  {
    if(typeof arguments[1]=='object')
    {
      options = jQuery.extend(options, arguments[1]);
    }
  }

  /**
   *
   *
   */
  this.doAction = function (fct)
  {
    switch(fct)
    {
      case 'add':
        /* function 'add' : adding an item
         * the second parameter is the item content
         * the third parameter is extra data associated with item
         */
        if(arguments.length==3)
        {
          if(typeof arguments[1]=='string')
          {
            addItem(arguments[1], arguments[2]);
          }
        }
        break;
      case 'delete':
        /* function 'delete' : remove an item
         * the second parameter is the item ID
         */
        if(arguments.length==2)
        {
          if(typeof arguments[1]=='string')
          {
            deleteItem(arguments[1]);
          }
        }
        break;

      case 'edit':
        /* function 'edit' : edit an item content
         * the second parameter is the item ID
         * the third parameter is the new content
         * the fourth parameter is the new extra data associated with item
         */
        if(arguments.length==4)
        {
          if(typeof arguments[1]=='string' && typeof arguments[2]=='string' )
          {
            editItem(arguments[1], arguments[2], arguments[3]);
          }
        }
        break;

      case 'get':
        /* function 'get' : returns extra data associated with item, ready to be
         * used
         */
        return(getItems());
        break;

      case 'getExtraData':
        /* function 'getExtraData' : returns extra data associated with item in
         * native format
         */
        if(arguments.length==2)
        {
          return(getExtraData(arguments[1]));
        }
        else
        {
          return(null);
        }
        break;

      case 'clear':
        /* function 'clear' : clear all criteria
         */
        clearItems();
        break;

      case 'send':
        /* function 'send' : send request to the server
         */
        sendRequest();
        break;

      case 'getPage':
        /* function 'send' : send request to the server
         * the second parameter is the request number
         * the third parameter is the page number
         * the fourth parameter is the number of ityem per page
         */
        if(arguments.length==4)
        {
          getPage(arguments[1], arguments[2], arguments[3]);
        }
        break;

      case 'setOptions':
        /* function 'setOptions' : allows to set options after the object was
         * created
         */
        if(arguments.length==2)
        {
          return(setOptions(arguments[1]));
        }
        break;
    }
  };

  /**
   * wrap an item in a new group
   *
   * !it's considered that the current item parent is the criteria builder area!
   *
   * @param String item : ID of the item to be wrapped
   */
  var addGroup = function (itemId)
  {
    counters.group++;

    var content="<li id='"+itemsId.group+counters.group+"' class='cbGroup cbSortable cbOpAND "+options.classGroup+"'>";
    content+="<ul></ul></li>";

    $('#'+itemId).wrap(content);

    content="<div class='cbSortHandle'>";
    content+="<div id='"+itemsId.group+counters.group+"OpAND' class='"+options.classOperator+"' style='display:none;'>"+options.textAND+"</div>";

    content+="<div id='"+itemsId.group+counters.group+"OpOR' class='"+options.classOperator+"' style='display:none;'>"+options.textOR+"</div>";
    content+="</div>";

    $("#"+itemsId.group+counters.group).prepend(content);

    $('#'+itemsId.group+counters.group+'OpAND').bind('click', itemsId.group+counters.group, onSwitchOperator);
    $('#'+itemsId.group+counters.group+'OpOR').bind('click', itemsId.group+counters.group, onSwitchOperator);

    applyNested();
  };

  /**
   * remove a group
   *
   * @param String groupId : ID of the group
   */
  var removeGroup = function (groupId)
  {
    $('#'+groupId).remove();
  };

  /**
   * add a new item in the criteria builder area
   *
   * @param String content : content of the new item
   */
  var addItem = function (itemContent, data)
  {
    counters.item++;

    var content="<li id='"+itemsId.item+counters.item+"' class='cbItem cbSortable "+options.classItem+"'>";
    content+="<div class='cbItemButtons' style='float:right;'>";

    if(options.imgEditUrl!='' &&
       options.onEdit!=null &&
       jQuery.isFunction(options.onEdit)) content+="<img id='iImgEdit"+counters.item+"' src='"+options.imgEditUrl+"'/>";

    if(options.imgDeleteUrl!='' &&
       options.onDelete!=null &&
       jQuery.isFunction(options.onDelete)) content+="<img id='iImgDelete"+counters.item+"' src='"+options.imgDeleteUrl+"'/>";

    content+="</div><div class='cbSortHandle'>"+itemContent+"</div></li>";

    $('#'+itemsId.container).append(content);

    addGroup(itemsId.item+counters.item);

    if(options.imgEditUrl!='' && options.onEdit!=null)
    {
      $('#iImgEdit'+counters.item).bind('click', itemsId.item+counters.item, options.onEdit);
    }

    if(options.imgDeleteUrl!='' && options.onDelete!=null)
    {
      $('#iImgDelete'+counters.item).bind('click', itemsId.item+counters.item, options.onDelete);
    }

    extraData[counters.item]=data;
  };

  /**
   * remove an item from the criteria builder area and do a check to determine
   * if parent group have to be removed
   *
   * @param String itemId : ID of the item to remove
   */
  var deleteItem = function (itemId)
  {
    if($('#'+itemId).length!=0)
    {
      $('#'+itemId).remove();
      re=/[0-9]*$/;
      extraData[eval(re.exec(itemId)[0])]=null;
      manage();
    }
  };

  /**
   * modify the content of an item
   *
   * if set, trigger the 'onEdit' function after the item was modified
   *
   * @param String itemId : ID of the item to modify
   * @param String content : the new content to be applied
   */
  var editItem = function (itemId, content, data)
  {
    if($('#'+itemId).length!=0)
    {
      $('#'+itemId+' .cbSortHandle').html(content);
      re=/[0-9]*$/;
      extraData[eval(re.exec(itemId)[0])]=data;
    }
  };

  /**
   * clear all the criteria
   */
  var clearItems = function()
  {
    $('#'+itemsId.container).NestedSortableDestroy();
    $('#'+itemsId.container).html("");
    counters.item=0;
    counters.group=0;
    extraData=new Array();
  };

  /**
   * used by the getItems to serialize extraData objects
   *
   * @param String prefix : the prefix name for variable in the serialized string
   * @param value : the value of the variable
   * @return String : the serialized object
   */
  var serializeData=function(prefix, value)
  {
    returned='';
    if(typeof value =='object')
    {
      for(var key in value )
      {
        if(typeof value[key] =='object')
        {
          returned+=serializeData(prefix+'['+key+']', value[key]);
        }
        else
        {
          returned+='&'+prefix+'['+key+']='+value[key];
        }
      }
    }
    else
    {
      returned+='&'+prefix+'='+value;
    }
    return(returned);
  };


  /**
   *
   * @return String : items in a string ready to use in an url
   */
  var getItems = function()
  {
    //group & items tree
    serialized=jQuery.iNestedSortable.serialize(itemsId.container)['hash'];

    //items extraData
    tmp=Array();
    for(i=0;i<extraData.length;i++)
    {
      if(extraData[i]!=null)
      {
        serialized+=serializeData('extraData['+i+']', extraData[i]);
      }
    }

    //group Operators
    $('#'+itemsId.container+' .cbGroup').each(
      function ()
      {
        re=/[0-9]*$/;
        serialized+='&operator['+re.exec(this.id)[0]+']=';
        if($(this).hasClass('cbOpOR'))
        {
          serialized+='OR';
        }
        else
        {
          serialized+='AND';
        }
      }
    );

    return(serialized);
  };


  /**
   *
   * @return : return extradata (in native format) associated with item
   */
  var getExtraData = function(itemId)
  {
    re=/[0-9]*$/;
    extraDataNumber=re.exec(itemId)[0];

    return(extraData[extraDataNumber]);
  };


  /**
   *
   * @param Object options : set the given option
   */
  var setOptions = function(optionsToSet)
  {
    options = jQuery.extend(options, optionsToSet);
  };

  /**
   * display/hide operator title for a group
   *
   * @param String groupId : ID of the group
   * @param Boolean visible : set true to display the title, false to hide it
   */
  var displayOperator = function (groupId, visible)
  {
    if($('#'+groupId).hasClass('cbOpAND'))
    {
      if(visible)
      {
        $('#'+groupId+'OpAND').css('display', 'block');
      }
      else
      {
        $('#'+groupId+'OpAND').css('display', 'none');
      }
    }
    else
    {
      if(visible)
      {
        $('#'+groupId+'OpOR').css('display', 'block');
      }
      else
      {
        $('#'+groupId+'OpOR').css('display', 'none');
      }
    }
  };

  /**
   * manage the criteria builder groups&items
   *
   * check validity for a group : an empty group is removed
   * check validity for an item : for an item directly attached to the criteria
   *                              builder area is wrapped in a new group
   */
  var manage = function ()
  {
    $('#'+itemsId.container+' li').each(
      function()
      {
        if($(this).hasClass('cbGroup'))
        {
          if($('#'+this.id+' li.cbItem').length==0)
          {
            // a group without item is removed
            removeGroup(this.id);
          }
          else if($('#'+this.id+' li.cbItem').length==1)
          {
            displayOperator(this.id, false);
          }
          else
          {
            displayOperator(this.id, true);
          }
        }
        else if($(this).hasClass('cbItem'))
        {
          if($(this).parent().get(0).id==itemsId.container)
          {
            // an item without group as parent is wrapped in a new group
            addGroup(this.id);
          }
        }
      }
    );
  };

  /**
   * this function make the groups&items ready to be sorted & grouped
   */
  var applyNested = function ()
  {
   // $.data($('#'+itemsId.container)[0], 'id', this);
    $('#'+itemsId.container).NestedSortableDestroy();
    $('#'+itemsId.container).NestedSortable(
      {
        accept: 'cbSortable',
        noNestingClass: 'cbItem',
        opacity: options.opacity,
        helperclass: options.classHelper,
        serializeRegExp:/.*/i,
        autoScroll: true,
        handle: '.cbSortHandle',
        ghosting:false,
        nestingPxSpace:15,

        onChange: function(serialized) {
          manage();
        },
      }
    );
  };

  /**
   * switch the operator for a group
   *
   * event.data = ID of the group
   */
  onSwitchOperator = function (event)
  {
    groupId=event.data;

    if($('#'+groupId).hasClass('cbOpAND'))
    {
      $('#'+groupId).removeClass('cbOpAND').addClass('cbOpOR');
      $('#'+groupId+'OpAND').css('display', 'none');
      $('#'+groupId+'OpOR').css('display', 'block');
    }
    else
    {
      $('#'+groupId).removeClass('cbOpOR').addClass('cbOpAND');
      $('#'+groupId+'OpAND').css('display', 'block');
      $('#'+groupId+'OpOR').css('display', 'none');
    }
  };

  /**
   *
   *
   */
  var sendRequest = function()
  {
    datas=encodeURI('requestName='+itemsId.container+'&'+getItems());
    $.ajax(
      {
        type: "POST",
        url: options.ajaxUrl+'execute',
        async: true,
        data: datas,
        success: function(msg)
          {
            if(options.onRequestSuccess!=null && jQuery.isFunction(options.onRequestSuccess)) options.onRequestSuccess(msg);
          },
        error: function(msg)
          {
            if(options.onRequestError!=null && jQuery.isFunction(options.onRequestError)) options.onRequestError(msg);
          },
       }
     );

  };

  /**
   *
   *
   */
  var getPage = function(requestNumber, pageNumber, numberPerPage)
  {
    datas=encodeURI('requestName='+itemsId.container+'&'+getItems());
    $.ajax(
      {
        type: "POST",
        url: options.ajaxUrl+'getPage',
        async: true,
        data: {page:pageNumber, requestNumber:requestNumber, numPerPage:numberPerPage},
        success: function(msg)
          {
            if(options.onGetPageSuccess!=null && jQuery.isFunction(options.onGetPageSuccess)) options.onGetPageSuccess(msg);
          },
        error: function(msg)
          {
            if(options.onGetPageError!=null && jQuery.isFunction(options.onGetPageError)) options.onGetPageError(msg);
          },
       }
     );

  };

  applyNested();
};


criteriaBuilder.makeExtendedData = function(owner, data)
{
  return(
    {
      owner:owner,
      param:data,
    }
  );
}
