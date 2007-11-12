<?php
/**
 * Registry interface
 * 
 * @package Xinc
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
interface Xinc_Registry_Interface
{
    public static function &getInstance();
    
    /**
     * Registers an object
     *
     * @param string $name
     * @param object $object
     * @throws Xinc_Registry_Exception
     */
    public function register($name, &$object);
    
    /**
     * Unregisters an Object
     *
     * @param string $name
     * @return object the unregistered Object
     * @throws Xinc_Registry_Exception
     */
    public function unregister($name);
    
    /**
     * Returns the registered object
     *
     * @param string $name
     * @return object
     * @throws Xinc_Registry_Exception
     */
    public function &get($name);
}