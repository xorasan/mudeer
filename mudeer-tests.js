/* mudeer-tests
 * 
 * register your test using $.register_test( name, callback, level )
 * 
 * level 0: optional, 1: normal, 2: important, 3: critical, 4: essential
 * 
 * when mudeer-tests is run, it'll index all the tests
 * and run the callbacks one by one
 * 
 * each callback will be passed ( done, queue )
 * which you just call using done(queue, error?) at the end of your test
 * 
 * error 0: no, 1: yes failed
 * 
 * at the very end it shows total tests passed and failed
 * */

'use strict';













