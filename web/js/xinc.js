function openMenuTab(id, title, url, iconClass, scripts, framed, height){
var isExternal = url.substring(0, 7) == "http://";

if(height == null) {
 height='100%';
}

var tab=Ext.getCmp(id);
if(tab) {
tab.show();
return;
}
if(!isExternal && !framed) {
var tab=new Ext.Panel({
  id: id,
  autoScroll: true,
  tabTip: title,
  title: title,
  tbar: [
    title
  ],
  autoDestroy: true,
  plugins: new Ext.ux.TabCloseMenu(),
  iconCls: iconClass,
  autoLoad: {
    url: url,
    scripts: scripts,
    nocache: true,
    text: "Loading...",
    timeout: 30,
    frame: true
  },
  closable:true
});
tab.on('close',function(p) {
 p.destroy();
});
} else {
var tab=new Ext.ux.ManagedIFrame.Panel({
  id: id,
  autoScroll: true,
  autoShow: true,
  title: title,
  tbar: [
    title
  ],
  tabTip: title,
  autoDestroy: true,
  plugins: new Ext.ux.TabCloseMenu(),
  type:'iframepanel',
  defaultSrc : url,
  iframeStyle : {overflow:'auto', height: height},
  closable:true
});
tab.tabTip=title;
tab.qtip=title;
tab.on('close',function(p) {
 p.destroy();
});
}

var c=Ext.getCmp('doc-body').add(tab);
c.show();
return false;

}

function openTab(name, build, label){
var tab=Ext.getCmp('project-'+name +'-'+build);
var title= name + ' - ' + label;
if(tab) {
tab.show();
return;
}
var tab=new Ext.Panel({
id: 'project-'+name+'-'+build,
autoScroll: true,
tbar: [
                title
                ],
title: label + ' - ' +name,
autoDestroy: true,
plugins: new Ext.ux.TabCloseMenu(),
autoLoad: {url: './dashboard/detail?project='+name, scripts: true,
nocache: true,
    text: "Loading...",
    timeout: 30},
closable:true
});
tab.on('close',function(p) {
 p.destroy();
});
var c=Ext.getCmp('doc-body').add(tab);
c.show();
return false;

}

Ext.BLANK_IMAGE_URL = './extjs/resources/images/default/s.gif';


ApiPanel = function() {
    ApiPanel.superclass.constructor.call(this, {
        id:'api-tree',
        region:'west',
        split:true,
        width: 280,
        minSize: 175,
        maxSize: 500,
        collapsible: true,
        margins:'0 0 5 5',
        cmargins:'0 0 0 0',
        rootVisible:false,
        lines:false,
        autoScroll:true,
        animCollapse:false,
        animate: false,
        collapseMode:'mini',
        loader: new Ext.tree.TreeLoader({
			preloadChildren: true,
			clearOnLoad: false
		}),
        root: new Ext.tree.AsyncTreeNode({
            text:'Ext JS',
            id:'root',
            expanded:true,
            //children:[Docs.classData]
            children:[MenuItems]
            
         }),
        collapseFirst:false
    });
    // no longer needed!
    //new Ext.tree.TreeSorter(this, {folderSort:true,leafAttr:'isClass'});
   
    this.getSelectionModel().on('beforeselect', function(sm, node){
        if (node.attributes.url != null) {
            openMenuTab(node.attributes.id,node.attributes.title,node.attributes.url,node.attributes.iconCls,node.attributes.scripts, node.attributes.iframe, node.attributes.height);
            return false;
        }
        return node.isLeaf();
    });
};

Ext.extend(ApiPanel, Ext.tree.TreePanel, {
    selectClass : function(cls){
        if(cls){
            var parts = cls.split('.');
            var last = parts.length-1;
            for(var i = 0; i < last; i++){ // things get nasty - static classes can have .
                var p = parts[i];
                var fc = p.charAt(0);
                var staticCls = fc.toUpperCase() == fc;
                if(p == 'Ext' || !staticCls){
                    parts[i] = 'pkg-'+p;
                }else if(staticCls){
                    --last;
                    parts.splice(i, 1);
                }
            }
            parts[last] = cls;

            //this.selectPath('/root/xinc/');//+parts.join('/'));
            
        }
    }
});


DocPanel = Ext.extend(Ext.Panel, {
    closable: true,
    autoScroll:true,

    initComponent : function(){
        var ps = this.cclass.split('.');
        this.title = ps[ps.length-1];

        DocPanel.superclass.initComponent.call(this);
    },

    scrollToMember : function(member){
        var el = Ext.fly(this.cclass + '-' + member);
        if(el){
            var top = (el.getOffsetsTo(this.body)[1]) + this.body.dom.scrollTop;
            this.body.scrollTo('top', top-25, {duration:.75, callback: this.hlMember.createDelegate(this, [member])});
        }
    },

	scrollToSection : function(id){
		var el = Ext.getDom(id);
		if(el){
			var top = (Ext.fly(el).getOffsetsTo(this.body)[1]) + this.body.dom.scrollTop;
			this.body.scrollTo('top', top-25, {duration:.5, callback: function(){
                Ext.fly(el).next('h2').pause(.2).highlight('#8DB2E3', {attr:'color'});
            }});
        }
	},

    hlMember : function(member){
        var el = Ext.fly(this.cclass + '-' + member);
        if(el){
            el.up('tr').highlight('#cadaf9');
        }
    }
});


MainPanel = function(){
	
	this.searchStore = new Ext.data.Store({
        proxy: new Ext.data.ScriptTagProxy({
            url: 'http://extjs.com/playpen/api.php'
        }),
        reader: new Ext.data.JsonReader({
	            root: 'data'
	        }, 
			['cls', 'member', 'type', 'doc']
		),
		baseParams: {}
        /**listeners: {
            'beforeload' : function(){
                this.baseParams.qt = Ext.getCmp('search-type').getValue();
            }
        }*/
    }); 
	
    MainPanel.superclass.constructor.call(this, {
        id:'doc-body',
        region:'center',
        margins:'0 5 5 0',
        resizeTabs: true,
        minTabWidth: 175,
        tabWidth: 225,
        plugins: new Ext.ux.TabCloseMenu(),
        enableTabScroll: true,
        activeTab: 0,
        items: {
            id:'widget-dashboard',
            title: 'Dashboard',
            autoLoad: {url: './dashboard/projects', callback: this.initSearch, scope: this, scripts: true, nocache:true, timeout:30},
            iconCls:'icon-dashboard',
            autoScroll: true,
            scripts: true
			/**tbar: [
				'Search: ', ' ',
                new Ext.ux.SelectBox({
                    listClass:'x-combo-list-small',
                    width:90,
                    value:'Starts with',
                    id:'search-type',
                    store: new Ext.data.SimpleStore({
                        fields: ['text'],
                        expandData: true,
                        data : ['Starts with', 'Ends with', 'Any match']
                    }),
                    displayField: 'text'
                }), ' ',
                new Ext.app.SearchField({
	                width:240,
					store: this.searchStore,
					paramName: 'q'
	            })
            ]*/
        }
    });
};

Ext.extend(MainPanel, Ext.TabPanel, {

    initEvents : function(){
        MainPanel.superclass.initEvents.call(this);
        this.body.on('click', this.onClick, this);
    },

    onClick: function(e, target){
        if(target = e.getTarget('a:not(.exi)', 3)){
            var cls = Ext.fly(target).getAttributeNS('ext', 'cls');
            e.stopEvent();
            if(cls){
                var member = Ext.fly(target).getAttributeNS('ext', 'member');
                this.loadClass(target.href, cls, member);
            }else if(target.className == 'inner-link'){
                loadProject = target.href.split('#')[1];
                openTab(loadProject, projects[loadProject][0], projects[loadProject][1])
            }else if(target.className=='external'){
                if (target.href.lastIndexOf('.html') > 0) {
                   openMenuTab(target.href, target.href, target.href, null, true, true);
                } else {
                   window.open(target.href);
                }
            } else {
                if (target.href.lastIndexOf('.html') > 0) {
                   openMenuTab(target.href, target.href, target.href, null, true, true);
                   return false;
                }
            }
        }else if(target = e.getTarget('.micon', 2)){
            e.stopEvent();
            var tr = Ext.fly(target.parentNode);
            if(tr.hasClass('expandable')){
                tr.toggleClass('expanded');
            }
        }
    },

    loadClass : function(href, cls, member){
        var id = 'menu-' + cls;
        var tab = this.getComponent(id);
        if(tab){
            this.setActiveTab(tab);
            if(member){
                tab.scrollToMember(member);
            }
        }else{
            var autoLoad = {url: href};
            if(member){
                autoLoad.callback = function(){
                    Ext.getCmp(id).scrollToMember(member);
                }
            }
            var p = this.add(new DocPanel({
                id: id,
                cclass : cls,
                autoLoad: autoLoad,
                iconCls: Docs.icons[cls],
                scripts: true
            }));
            this.setActiveTab(p);
        }
    },
	
	initSearch : function(){
		// Custom rendering Template for the View
	    var resultTpl = new Ext.XTemplate(
	        '<tpl for=".">',
	        '<div class="search-item">',
	            '<a class="member" ext:cls="{cls}" ext:member="{member}" href="output/{cls}.html">',
				'<img src="./extjs/resources/images/default/s.gif" class="item-icon icon-{type}"/>{member}',
				'</a> ',
				'<a class="cls" ext:cls="{cls}" href="output/{cls}.html">{cls}</a>',
	            '<p>{doc}</p>',
	        '</div></tpl>'
	    );
		
		/**var p = new Ext.DataView({
            applyTo: 'search',
			tpl: resultTpl,
			loadingText:'Searching...',
            store: this.searchStore,
            itemSelector: 'div.search-item',
			emptyText: ''
        });*/
	},
	
	doSearch : function(e){
		var k = e.getKey();
		if(!e.isSpecialKey()){
			var text = e.target.value;
			if(!text){
				this.searchStore.baseParams.q = '';
				this.searchStore.removeAll();
			}else{
				this.searchStore.baseParams.q = text;
				this.searchStore.reload();
			}
		}
	}
});


Ext.onReady(function(){

    //Ext.QuickTips.init();

    var api = new ApiPanel();
    var mainPanel = new MainPanel();

    //api.on('click', function(node, e){
    //     if(node.isLeaf()){
    //        e.stopEvent();
    //        mainPanel.loadClass(node.attributes.href, node.id);
    //     }
    //});

    //mainPanel.on('tabchange', function(tp, tab){
    //    api.selectClass(tab.cclass); 
    //});

    var hd = new Ext.Panel({
        border: false,
        layout:'anchor',
        region:'north',
        cls: 'docs-header',
        height:60,
        items: [{
            xtype:'box',
            el:'header',
            border:false,
            anchor: 'none -25'
        }
        /**new Ext.Toolbar({
            cls:'top-toolbar',
            items:[ ' ',
			new Ext.form.TextField({
				width: 200,
				emptyText:'',
				listeners:{
					render: function(f){
						f.el.on('keydown', filterTree, f, {buffer: 350});
					}
				}
			}), ' ', ' ',
			{
                iconCls: 'icon-expand-all',
				tooltip: 'Expand All',
                handler: function(){ api.root.expand(true); }
            }, '-', {
                iconCls: 'icon-collapse-all',
                tooltip: 'Collapse All',
                handler: function(){ api.root.collapse(true); }
            }, '->', {
                tooltip:'Hide Inherited Members',
                iconCls: 'icon-hide-inherited',
                enableToggle: true,
                toggleHandler : function(b, pressed){
                     mainPanel[pressed ? 'addClass' : 'removeClass']('hide-inherited');
                }
            }, '-', {
                tooltip:'Expand All Members',
                iconCls: 'icon-expand-members',
                enableToggle: true,
                toggleHandler : function(b, pressed){
                    mainPanel[pressed ? 'addClass' : 'removeClass']('full-details');
                }
            }]
        })*/]
    })

    var viewport = new Ext.Viewport({
        layout:'border',
        items:[ hd, api, mainPanel ]
    });

    //api.expandPath('/root/apidocs');

    // allow for link in
    //var page = window.location.href.split('?')[1];
    //if(page){
    //    var ps = Ext.urlDecode(page);
    //    var cls = ps['class'];
    //    mainPanel.loadClass('output/' + cls + '.html', cls, ps.member);
    //}
    
    viewport.doLayout();
	
	setTimeout(function(){
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({remove:true});
    }, 250);
	
	var filter = new Ext.tree.TreeFilter(api, {
		clearBlank: true,
		autoClear: true
	});
	var hiddenPkgs = [];
	function filterTree(e){
		var text = e.target.value;
		Ext.each(hiddenPkgs, function(n){
			n.ui.show();
		});
		if(!text){
			filter.clear();
			return;
		}
		api.expandAll();
		
		var re = new RegExp('^' + Ext.escapeRe(text), 'i');
		filter.filterBy(function(n){
			return !n.attributes.isClass || re.test(n.text);
		});
		
		// hide empty packages that weren't filtered
		hiddenPkgs = [];
		api.root.cascade(function(n){
			if(!n.attributes.isClass && n.ui.ctNode.offsetHeight < 3){
				n.ui.hide();
				hiddenPkgs.push(n);
			}
		});
	}
	
});


Ext.app.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent : function(){
        if(!this.store.baseParams){
			this.store.baseParams = {};
		}
		Ext.app.SearchField.superclass.initComponent.call(this);
		this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'query',

    onTrigger1Click : function(){
        if(this.hasSearch){
            this.store.baseParams[this.paramName] = '';
			this.store.removeAll();
			this.el.dom.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
			this.focus();
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
		if(v.length < 2){
			Ext.Msg.alert('Invalid Search', 'You must enter a minimum of 2 characters to search the API');
			return;
		}
		this.store.baseParams[this.paramName] = v;
        var o = {start: 0};
        this.store.reload({params:o});
        this.hasSearch = true;
        this.triggers[0].show();
		this.focus();
    }
});


/**
 * Makes a ComboBox more closely mimic an HTML SELECT.  Supports clicking and dragging
 * through the list, with item selection occurring when the mouse button is released.
 * When used will automatically set {@link #editable} to false and call {@link Ext.Element#unselectable}
 * on inner elements.  Re-enabling editable after calling this will NOT work.
 *
 * @author Corey Gilmore
 * http://extjs.com/forum/showthread.php?t=6392
 *
 * @history 2007-07-08 jvs
 * Slight mods for Ext 2.0
 */
Ext.ux.SelectBox = function(config){
	this.searchResetDelay = 1000;
	config = config || {};
	config = Ext.apply(config || {}, {
		editable: false,
		forceSelection: true,
		rowHeight: false,
		lastSearchTerm: false,
        triggerAction: 'all',
        mode: 'local'
    });

	Ext.ux.SelectBox.superclass.constructor.apply(this, arguments);

	this.lastSelectedIndex = this.selectedIndex || 0;
};

Ext.extend(Ext.ux.SelectBox, Ext.form.ComboBox, {
    lazyInit: false,
	initEvents : function(){
		Ext.ux.SelectBox.superclass.initEvents.apply(this, arguments);
		// you need to use keypress to capture upper/lower case and shift+key, but it doesn't work in IE
		this.el.on('keydown', this.keySearch, this, true);
		this.cshTask = new Ext.util.DelayedTask(this.clearSearchHistory, this);
	},

	keySearch : function(e, target, options) {
		var raw = e.getKey();
		var key = String.fromCharCode(raw);
		var startIndex = 0;

		if( !this.store.getCount() ) {
			return;
		}

		switch(raw) {
			case Ext.EventObject.HOME:
				e.stopEvent();
				this.selectFirst();
				return;

			case Ext.EventObject.END:
				e.stopEvent();
				this.selectLast();
				return;

			case Ext.EventObject.PAGEDOWN:
				this.selectNextPage();
				e.stopEvent();
				return;

			case Ext.EventObject.PAGEUP:
				this.selectPrevPage();
				e.stopEvent();
				return;
		}

		// skip special keys other than the shift key
		if( (e.hasModifier() && !e.shiftKey) || e.isNavKeyPress() || e.isSpecialKey() ) {
			return;
		}
		if( this.lastSearchTerm == key ) {
			startIndex = this.lastSelectedIndex;
		}
		this.search(this.displayField, key, startIndex);
		this.cshTask.delay(this.searchResetDelay);
	},

	onRender : function(ct, position) {
		this.store.on('load', this.calcRowsPerPage, this);
		Ext.ux.SelectBox.superclass.onRender.apply(this, arguments);
		if( this.mode == 'local' ) {
			this.calcRowsPerPage();
		}
	},

	onSelect : function(record, index, skipCollapse){
		if(this.fireEvent('beforeselect', this, record, index) !== false){
			this.setValue(record.data[this.valueField || this.displayField]);
			if( !skipCollapse ) {
				this.collapse();
			}
			this.lastSelectedIndex = index + 1;
			this.fireEvent('select', this, record, index);
		}
	},

	render : function(ct) {
		Ext.ux.SelectBox.superclass.render.apply(this, arguments);
		if( Ext.isSafari ) {
			this.el.swallowEvent('mousedown', true);
		}
		this.el.unselectable();
		this.innerList.unselectable();
		this.trigger.unselectable();
		this.innerList.on('mouseup', function(e, target, options) {
			if( target.id && target.id == this.innerList.id ) {
				return;
			}
			this.onViewClick();
		}, this);

		this.innerList.on('mouseover', function(e, target, options) {
			if( target.id && target.id == this.innerList.id ) {
				return;
			}
			this.lastSelectedIndex = this.view.getSelectedIndexes()[0] + 1;
			this.cshTask.delay(this.searchResetDelay);
		}, this);

		this.trigger.un('click', this.onTriggerClick, this);
		this.trigger.on('mousedown', function(e, target, options) {
			e.preventDefault();
			this.onTriggerClick();
		}, this);

		this.on('collapse', function(e, target, options) {
			Ext.getDoc().un('mouseup', this.collapseIf, this);
		}, this, true);

		this.on('expand', function(e, target, options) {
			Ext.getDoc().on('mouseup', this.collapseIf, this);
		}, this, true);
	},

	clearSearchHistory : function() {
		this.lastSelectedIndex = 0;
		this.lastSearchTerm = false;
	},

	selectFirst : function() {
		this.focusAndSelect(this.store.data.first());
	},

	selectLast : function() {
		this.focusAndSelect(this.store.data.last());
	},

	selectPrevPage : function() {
		if( !this.rowHeight ) {
			return;
		}
		var index = Math.max(this.selectedIndex-this.rowsPerPage, 0);
		this.focusAndSelect(this.store.getAt(index));
	},

	selectNextPage : function() {
		if( !this.rowHeight ) {
			return;
		}
		var index = Math.min(this.selectedIndex+this.rowsPerPage, this.store.getCount() - 1);
		this.focusAndSelect(this.store.getAt(index));
	},

	search : function(field, value, startIndex) {
		field = field || this.displayField;
		this.lastSearchTerm = value;
		var index = this.store.find.apply(this.store, arguments);
		if( index !== -1 ) {
			this.focusAndSelect(index);
		}
	},

	focusAndSelect : function(record) {
		var index = typeof record === 'number' ? record : this.store.indexOf(record);
		this.select(index, this.isExpanded());
		this.onSelect(this.store.getAt(record), index, this.isExpanded());
	},

	calcRowsPerPage : function() {
		if( this.store.getCount() ) {
			this.rowHeight = Ext.fly(this.view.getNode(0)).getHeight();
			this.rowsPerPage = this.maxHeight / this.rowHeight;
		} else {
			this.rowHeight = false;
		}
	}

});

Ext.Ajax.on('requestcomplete', function(ajax, xhr, o){
    if(typeof urchinTracker == 'function' && o && o.url){
        urchinTracker(o.url);
        
    }
});


