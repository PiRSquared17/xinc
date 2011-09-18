<?php
/**
 * Queue that is holding all the builds
 *  
 * @package Xinc.Build
 * @author Arno Schneider
 * @version 2.0
 * @copyright 2007 Arno Schneider, Barcelona
 * @license  http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see license.php
 *    This file is part of Xinc.
 *    Xinc is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License as published
 *    by the Free Software Foundation; either version 2.1 of the License, or    
 *    (at your option) any later version.
 *
 *    Xinc is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with Xinc, write to the Free Software
 *    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


require_once 'Xinc/Build/Queue/Interface.php';
require_once 'Xinc/Build/Iterator.php';


class Xinc_Build_Queue implements Xinc_Build_Queue_Interface
{
  
    /**
     * 
     *
     * @var Xinc_Build_Iterator
     */
    private $_builds;
    
    private $_lastBuild;
    
    private $_queue=array();
    
    /**
     * constructor for build queue
     *
     */
    public function __construct()
    {
        $this->_builds = new Xinc_Build_Iterator();
    }
    /**
     * adds a build to the queue
     * 
     * Calls the getNextBuildTime() method to put
     * the builds into the right order in the queue
     *
     * @param Xinc_Build_Interface $build
     */
    public function addBuild(Xinc_Build_Interface &$build)
    {
        
        $this->_builds->add($build);
    }
    
    /**
     * Adds a number of builds to the queue
     *
     * @param Xinc_Build_Iterator $builds
     */
    public function addBuilds(Xinc_Build_Iterator &$builds)
    {
        while ($builds->hasNext()) {
            $this->_builds->add($builds->next());
        }
    }
    
    /**
     * Returns the next build time of all the builds scheduled
     * in this queue
     *
     * @return integer unixtimestamp
     */
    public function getNextBuildTime()
    {
        $nextBuildTime = null;
        /**
         * Xinc_Build_Interface
         */
        $build = null;
        while ($this->_builds->hasNext()) {
            $build = $this->_builds->next();
            if ($build->getNextBuildTime() <= $nextBuildTime || $nextBuildTime === null) {
                if ($build->getStatus() != Xinc_Build_Interface::STOPPED) {
                    $buildTime = $build->getNextBuildTime();
                    
                    if ($buildTime !== null && !$build->isQueued()) {
                        $nextBuildTime = $buildTime;
                        /**
                         * Need to write to queue here and have a FIFO
                         * check before if not already in queue
                         */
                        //if (!in_array($build, $this->_queue)) {
                            $this->_queue[] = $build;
                            $build->enqueue();
                        //}
                    } else {
                        /**
                         * we need to check if a scheduled build has a lower build time
                         * but we dont want to queue it again
                         */
                        $nextBuildTime = $buildTime;
                    }
                }
            }
        
        }
        usort($this->_queue, array(&$this, 'sortQueue'));
        $this->_builds->rewind();
        return $nextBuildTime;
    }
    
    /**
     * Sorts the builds in the queue by buildtime
     *
     * @param Xinc_Build_Interface $a
     * @param Xinc_Build_Interface $b
     * @return integer
     */
    public function sortQueue($a, $b)
    {
        if ($a->getNextBuildTime() == $b->getNextBuildTime()) return 0;
        
        return $a->getNextBuildTime()<$b->getNextBuildTime() ? -1:1;
    }
    
    /**
     * Removes the next scheduled build from the queue
     * and returns it
     *
     * @return Xinc_Build_Interface
     */
    public function getNextBuild()
    {
        //if (count($this->_queue)<1) {
        //    $this->getNextBuildTime();
        //}
        usort($this->_queue, array(&$this, 'sortQueue'));
        if (isset($this->_queue[0])) {
            if ($this->_queue[0]->getNextBuildTime() <= time()) {
                
                $build = array_shift($this->_queue);
                $build->dequeue();
                return $build;
            }
        }
        return null;
        
        
        $now = time();
        $nextBuildTime = $now;
        $nextBuild = null;
        /**
         * Xinc_Build_Interface
         */
        $build = null;
        while ($this->_builds->hasNext()) {
            $build = $this->_builds->next();
        
            if ($build->getNextBuildTime() <= $now && 
                $build->getNextBuildTime() <= $nextBuildTime &&
                $build->getNextBuildTime() != null &&
                $build->getStatus() != Xinc_Build_Interface::STOPPED &&
                ($this->_builds->count()>1 && $build != $this->_lastBuild)) {
                    
                $nextBuildTime = $build->getNextBuildTime();
                $nextBuild = $build;
                $this->_lastBuild = $build;
            }
        }
        
        $this->_builds->rewind();
        return $nextBuild;
    }
   
}