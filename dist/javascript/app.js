 var dmp = new diff_match_patch();

function launch() {
  var text1 = document.getElementById('text1').value;
  var text2 = document.getElementById('text2').value;
  dmp.Diff_Timeout = parseFloat(document.getElementById('timeout').value);
  dmp.Diff_EditCost = parseFloat(document.getElementById('editcost').value);


  let punctuationArr = [];
  let plaintextArr = [];
  let plaintextLoc = [];
  let duplicateText2 = JSON.parse(JSON.stringify( text2 ));
  let text2Arr = duplicateText2.split('');
  text2Arr.forEach(function(element, index) {
      var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      var isChinese = reg.test(element);
      plaintextLoc.push( [index, element] );
      (isChinese == false) ? punctuationArr.push( [index, element] ) : plaintextArr.push([index, element] );       
  });

  // console.log('---plaintextArr---');
  // console.table(plaintextArr);
  // console.log('---punctuationArr---');
  // console.table(punctuationArr);
  // console.log('---plaintextLoc---');
  // console.table(plaintextLoc);

  let ms_start = (new Date()).getTime();
  let d = dmp.diff_main(text1, text2);
  let ms_end = (new Date()).getTime();

  console.table(d);

  let text = d;
  let insertion = [];
  let deletion  = [];
  let redundant = [];

  text.forEach(function(element, index) {
    let state = element[0];
    let words = element[1];

    if(words == " ") return;
    
    // -1 (1) insertion group
    let before = !text[index-1] ? [0, '首'] : text[index-1];
    let before_state = before[0];
    let before_words = before[1];
    if(state ==1 && index >=1 && before_state == -1) {
        if(!words) return;
        if( words.length != before_words.length) return;
        insertion.push( [index,words]  ) ; 
    } 

    // (-1) 1 deletion group
    let next = !text[index+1] ? [0, '末'] : text[index+1];
    let next_state = next[0];
    let next_words = next[1];
    if(state ==-1 && next_state == 1) {
        if(!words) return;
        if( words.length != next_words.length) return;
        deletion.push([index, words ]) ;
    } 
    else if(state ==-1) {
        redundant[index+1] = [ index, state, words, index+1, next_state, next_words ];
    }

  });

  console.log('---red deletion---');
  console.table(deletion);
  console.log('---green insertion---');
  console.table(insertion);
  console.log('---red redundant---');
  console.table(redundant);
  
  if (document.getElementById('semantic').checked) {
    dmp.diff_cleanupSemantic(d);
  }
  if (document.getElementById('efficiency').checked) {
    dmp.diff_cleanupEfficiency(d);
  }
  let ds = dmp.diff_prettyHtml(d);
  document.getElementById('outputdiv').innerHTML = ds + '<BR>Time: ' + (ms_end - ms_start) / 1000 + 's';
}

 diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
    var html = [];
    var pattern_amp = /&/g;
    var pattern_lt = /</g;
    var pattern_gt = />/g;
    var pattern_para = /\n/g;
    for (var x = 0; x < diffs.length; x++) {
      var op = diffs[x][0];    // Operation (insert, delete, equal)
      var data = diffs[x][1];  // Text of change.
      //var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
      //    .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
      var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
          .replace(pattern_gt, '&gt;').replace(pattern_para, '<br>');
      switch (op) {
        case DIFF_INSERT:
          html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
          break;
        case DIFF_DELETE:
          html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
          break;
        case DIFF_EQUAL:
          html[x] = '<span>' + text + '</span>';
          break;
      }
    }
    return html.join('');
  };