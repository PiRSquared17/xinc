<?php
/**
 * This interface represents a publishing mechanism to publish build results
 * 
 * @package Xinc
 * @author Arno Schneider
 * @version 2.0
 * @copyright 2007 David Ellis, One Degree Square
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
require_once 'Xinc/Plugin/Repos/ModificationSet/AbstractTask.php';

class Xinc_Plugin_Repos_ModificationSet_BuildAlways_Task extends Xinc_Plugin_Repos_ModificationSet_AbstractTask
{

    private $_plugin;
    private $_subtasks=array();

    /**
     * Directory containing the Subversion project.
     *
     * @var string
     */
    private $_directory = '.';
    public function getName()
    {
        return 'buildalways';
    }

    public function registerTask(Xinc_Plugin_Task_Interface &$task)
    {
        $this->_subtasks[]=$task;
    }



    public function __construct(Xinc_Plugin_Interface &$p)
    {
        $this->_plugin=$p;
    }

    public function getBuildSlot()
    {
        return Xinc_Plugin_Slot::PRE_PROCESS;
    }




    public function checkModified(Xinc_Project &$project)
    {
        return $this->_plugin->checkModified();
    }

    public function validateTask()
    {
        
        return true;
    }
     
}