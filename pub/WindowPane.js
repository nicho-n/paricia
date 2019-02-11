class WindowPane {
        constructor(title, htmlFile, width, height){
                this.title = title;
                this.htmlFile = htmlFile;
		this.width = width;
		this.height = height;
		this.isOpen = 0;
        }

	open(){
		var wpFrame = document.createElement('iframe')
		var wpTop = document.createElement('div');
		wpTop.className = "wpTop";
		wpFrame.className = "wpFrame";
		wpTop.id = this.title + "top";
		wpFrame.id = this.title;

		wpFrame.height = this.height;
		wpTop.style.width = this.width;
		wpTop.style.height = "30px";
		wpTop.style.display = "none";
		wpFrame.style.display = "none";
		wpFrame.width = this.width;
		wpFrame.src = this.htmlFile;
		wpTop.appendChild(wpFrame);
		document.body.appendChild(wpTop);
		dragElement(wpTop);
		this.isOpen = 1;
	}

	show(){
		var wpFrame = document.getElementById(this.title);
		var wpTop = document.getElementById(this.title+"top");
		wpFrame.style.display = 'block';
		wpTop.style.display = 'block';
	}

	hide(){
                var wpFrame = document.getElementById(this.title);
                var wpTop = document.getElementById(this.title+"top");
		wpFrame.style.display = 'none';
		wpTop.style.display = 'none';
	}

	remove(){
		var wpFrame = document.getElementById(this.title);
		var wpTop = document.getElementById(this.title + "top");
		wpTop.remove();
		wpFrame.remove();
		this.isOpen = 0;
	}

}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
   elmnt.onmousedown = dragMouseDown;


function dragMouseDown(e) {
    e = e || window.event;
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
}

function elementDrag(e) {
    e = e || window.event;
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
}
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}



